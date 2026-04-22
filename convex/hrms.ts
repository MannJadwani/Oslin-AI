import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

function reorderQuestions(
  questions: Array<{
    id: string;
    text: string;
    timeLimit?: number;
    allowRetake: boolean;
    elaborateText?: string;
    elaborateExtensionSeconds?: number;
  }>,
  questionOrder?: string[],
) {
  if (!questionOrder || questionOrder.length === 0) {
    return questions;
  }

  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const ordered = questionOrder
    .map((id) => questionMap.get(id))
    .filter((question): question is (typeof questions)[number] => question !== undefined);
  const orderedIds = new Set(questionOrder);
  const remaining = questions.filter((question) => !orderedIds.has(question.id));

  return [...ordered, ...remaining];
}

function clampLimit(value?: number) {
  return Math.min(Math.max(value ?? 50, 1), 200);
}

function buildUpdatedAt(
  interview: Doc<"interviews">,
  analysis?: Doc<"analyses"> | null,
) {
  return Math.max(
    interview._creationTime,
    interview.startedAt ?? 0,
    interview.completedAt ?? 0,
    analysis?._creationTime ?? 0,
  );
}

function randomHex(bytes: number) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getAnalysisForInterview(
  db: {
    query: any;
  },
  interviewId: Id<"interviews">,
): Promise<Doc<"analyses"> | null> {
  return await db
    .query("analyses")
    .withIndex("by_interview", (q: any) => q.eq("interviewId", interviewId))
    .first();
}

export const listApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const keys: Array<Doc<"hrmsApiKeys">> = await ctx.db
      .query("hrmsApiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return keys
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((key) => ({
        _id: key._id,
        label: key.label,
        keyPrefix: key.keyPrefix,
        createdAt: key.createdAt,
        lastUsedAt: key.lastUsedAt ?? null,
        revokedAt: key.revokedAt ?? null,
        isActive: !key.revokedAt,
      }));
  },
});

export const createApiKey = mutation({
  args: {
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const label = args.label.trim();
    if (!label) {
      throw new Error("Label is required");
    }

    const token = `hrms_${randomHex(24)}`;
    const keyHash = await sha256Hex(token);
    const createdAt = Date.now();
    const keyPrefix = `${token.slice(0, 13)}...`;

    const keyId = await ctx.db.insert("hrmsApiKeys", {
      userId,
      label,
      keyHash,
      keyPrefix,
      createdAt,
    });

    return {
      token,
      key: {
        _id: keyId,
        label,
        keyPrefix,
        createdAt,
        lastUsedAt: null,
        revokedAt: null,
        isActive: true,
      },
    };
  },
});

export const revokeApiKey = mutation({
  args: {
    keyId: v.id("hrmsApiKeys"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const key = await ctx.db.get(args.keyId);
    if (!key || key.userId !== userId) {
      throw new Error("API key not found");
    }

    if (key.revokedAt) {
      return;
    }

    await ctx.db.patch(args.keyId, {
      revokedAt: Date.now(),
    });
  },
});

export const authenticateApiKey = internalQuery({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const token = args.token.trim();
    if (!token) {
      return null;
    }

    const keyHash = await sha256Hex(token);
    const key = await ctx.db
      .query("hrmsApiKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .unique();

    if (!key || key.revokedAt) {
      return null;
    }

    return {
      keyId: key._id,
      userId: key.userId,
      label: key.label,
    };
  },
});

export const touchApiKey = internalMutation({
  args: {
    keyId: v.id("hrmsApiKeys"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keyId, {
      lastUsedAt: Date.now(),
    });
  },
});

export const exportJobProfiles = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const profiles: Array<Doc<"jobProfiles">> = await ctx.db
      .query("jobProfiles")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", args.userId))
      .collect();

    return profiles
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((profile) => ({
        id: profile._id,
        title: profile.title,
        description: profile.description,
        qualifications: profile.qualifications,
        questions: profile.questions,
        faq: profile.faq ?? [],
        status: profile.status,
        publicLinkId: profile.publicLinkId ?? null,
        shuffleQuestions: profile.shuffleQuestions ?? false,
        createdAt: profile._creationTime,
      }));
  },
});

export const exportInterviews = internalQuery({
  args: {
    userId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("analyzed"),
      ),
    ),
    updatedAfter: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const interviews: Array<Doc<"interviews">> = await ctx.db
      .query("interviews")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", args.userId))
      .collect();

    const limit = clampLimit(args.limit);
    const items = [];

    for (const interview of interviews) {
      if (args.status && interview.status !== args.status) {
        continue;
      }

      const [jobProfile, analysis, responses] = await Promise.all([
        ctx.db.get(interview.jobProfileId),
        getAnalysisForInterview(ctx.db, interview._id),
        ctx.db
          .query("responses")
          .withIndex("by_interview", (q) => q.eq("interviewId", interview._id))
          .collect(),
      ]);

      const updatedAt = buildUpdatedAt(interview, analysis);
      if (args.updatedAfter && updatedAt <= args.updatedAfter) {
        continue;
      }

      items.push({
        id: interview._id,
        jobProfileId: interview.jobProfileId,
        jobTitle: jobProfile?.title ?? "Unknown",
        candidateName: interview.candidateName ?? null,
        candidateEmail: interview.candidateEmail ?? null,
        status: interview.status,
        startedAt: interview.startedAt ?? null,
        completedAt: interview.completedAt ?? null,
        questionOrder: interview.questionOrder ?? [],
        responseCount: responses.length,
        overallScore: analysis?.overallScore ?? null,
        analysisSummary: analysis?.summary ?? null,
        createdAt: interview._creationTime,
        updatedAt,
      });
    }

    return items
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },
});

export const exportInterviewDetail = internalQuery({
  args: {
    userId: v.id("users"),
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview || interview.interviewerId !== args.userId) {
      return null;
    }

    const jobProfile = await ctx.db.get(interview.jobProfileId);
    if (!jobProfile) {
      return null;
    }

    const introQuestionsDoc = await ctx.db
      .query("introQuestions")
      .withIndex("by_user", (q) => q.eq("userId", jobProfile.interviewerId))
      .first();
    const introQuestions = introQuestionsDoc?.questions ?? [];
    const reorderedJobQuestions = interview.questionOrder
      ? reorderQuestions(jobProfile.questions, interview.questionOrder)
      : jobProfile.questions;
    const askedQuestions = [...introQuestions, ...reorderedJobQuestions];

    const [responses, analysis] = await Promise.all([
      ctx.db
        .query("responses")
        .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
        .collect(),
      getAnalysisForInterview(ctx.db, args.interviewId),
    ]);

    const questionAnalyses = new Map(
      (analysis?.questionAnalyses ?? []).map((item) => [item.questionId, item]),
    );

    const responsesByQuestion = new Map(
      responses.map((response) => [response.questionId, response]),
    );

    const questions = await Promise.all(
      askedQuestions.map(async (question, index) => {
        const response = responsesByQuestion.get(question.id);
        const questionAnalysis = questionAnalyses.get(question.id) ?? null;

        if (!response) {
          return {
            sequence: index + 1,
            ...question,
            response: null,
            analysis: questionAnalysis,
          };
        }

        let videoUrl: string | null = null;
        let videoChunkUrls: string[] = [];

        if (response.videoChunkIds && response.videoChunkIds.length > 0) {
          const urls = await Promise.all(
            response.videoChunkIds.map((chunkId) => ctx.storage.getUrl(chunkId)),
          );
          videoChunkUrls = urls.filter((url): url is string => url !== null);
        } else if (response.videoStorageId) {
          videoUrl = await ctx.storage.getUrl(response.videoStorageId);
        }

        return {
          sequence: index + 1,
          ...question,
          response: {
            id: response._id,
            duration: response.duration,
            attemptNumber: response.attemptNumber,
            transcript: response.transcript ?? null,
            videoUrl,
            videoChunkUrls,
            isChunked: videoChunkUrls.length > 0,
          },
          analysis: questionAnalysis,
        };
      }),
    );

    return {
      interview: {
        id: interview._id,
        jobProfileId: interview.jobProfileId,
        candidateName: interview.candidateName ?? null,
        candidateEmail: interview.candidateEmail ?? null,
        status: interview.status,
        startedAt: interview.startedAt ?? null,
        completedAt: interview.completedAt ?? null,
        createdAt: interview._creationTime,
        updatedAt: buildUpdatedAt(interview, analysis),
      },
      jobProfile: {
        id: jobProfile._id,
        title: jobProfile.title,
        description: jobProfile.description,
        qualifications: jobProfile.qualifications,
        status: jobProfile.status,
        publicLinkId: jobProfile.publicLinkId ?? null,
        shuffleQuestions: jobProfile.shuffleQuestions ?? false,
        faq: jobProfile.faq ?? [],
      },
      analysis: analysis
        ? {
            overallScore: analysis.overallScore,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            communicationStyle: analysis.communicationStyle,
            confidenceLevel: analysis.confidenceLevel,
            skillAlignment: analysis.skillAlignment,
            redFlags: analysis.redFlags,
            summary: analysis.summary,
          }
        : null,
      questions: questions.map((item) => item),
    };
  },
});
