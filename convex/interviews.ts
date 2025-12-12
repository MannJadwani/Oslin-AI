import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Keep for backward compatibility if needed, but we encourage public links
function generateLinkId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export const create = mutation({
  args: {
    jobProfileId: v.id("jobProfiles"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db.get(args.jobProfileId);
    if (!profile || profile.interviewerId !== userId) {
      throw new Error("Not authorized");
    }

    const linkId = generateLinkId();

    const interviewId = await ctx.db.insert("interviews", {
      jobProfileId: args.jobProfileId,
      interviewerId: userId,
      linkId,
      status: "pending",
    });

    return { interviewId, linkId };
  },
});

// Helper to reorder questions based on questionOrder
function reorderQuestions(questions: Array<{ id: string; text: string; timeLimit?: number; allowRetake: boolean }>, questionOrder?: string[]) {
  if (!questionOrder || questionOrder.length === 0) {
    return questions;
  }
  
  // Create a map for quick lookup
  const questionMap = new Map(questions.map(q => [q.id, q]));
  
  // Reorder based on questionOrder, filtering out any missing questions
  const reordered = questionOrder
    .map(id => questionMap.get(id))
    .filter((q): q is typeof questions[0] => q !== undefined);
  
  // Add any questions not in questionOrder at the end
  const orderedIds = new Set(questionOrder);
  const remaining = questions.filter(q => !orderedIds.has(q.id));
  
  return [...reordered, ...remaining];
}

export const getByLink = query({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    // Try to find a specific interview first (legacy/unique invite)
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_link_id", (q) => q.eq("linkId", args.linkId))
      .first();

    if (interview) {
      const jobProfile = await ctx.db.get(interview.jobProfileId);
      if (!jobProfile) {
        return null;
      }
      
      // Reorder questions if questionOrder exists
      const reorderedQuestions = interview.questionOrder 
        ? reorderQuestions(jobProfile.questions, interview.questionOrder)
        : jobProfile.questions;
      
      return {
        interview,
        jobProfile: {
          ...jobProfile,
          questions: reorderedQuestions,
        },
        type: "invite" as const
      };
    }

    // If not found, check if it's a public link for a job profile
    const jobProfile = await ctx.db
      .query("jobProfiles")
      .withIndex("by_public_link_id", (q) => q.eq("publicLinkId", args.linkId))
      .first();

    if (jobProfile && jobProfile.status === "active") {
        return {
            interview: null,
            jobProfile,
            type: "public" as const
        };
    }

    return null;
  },
});

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const startInterview = mutation({
  args: {
    linkId: v.string(),
    candidateName: v.string(),
    candidateEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Check if it's a unique invite link
    const existingInterview = await ctx.db
      .query("interviews")
      .withIndex("by_link_id", (q) => q.eq("linkId", args.linkId))
      .first();

    if (existingInterview) {
      if (existingInterview.status !== "pending") {
         throw new Error("Interview already started");
      }
      
      const jobProfile = await ctx.db.get(existingInterview.jobProfileId);
      let questionOrder: string[] | undefined = undefined;
      
      // Shuffle questions if enabled
      if (jobProfile?.shuffleQuestions && jobProfile.questions.length > 0) {
        questionOrder = shuffleArray(jobProfile.questions.map(q => q.id));
      }
      
      await ctx.db.patch(existingInterview._id, {
        candidateName: args.candidateName,
        candidateEmail: args.candidateEmail,
        status: "in_progress",
        startedAt: Date.now(),
        questionOrder,
      });
      return existingInterview._id;
    }

    // 2. Check if it's a public link
    const jobProfile = await ctx.db
        .query("jobProfiles")
        .withIndex("by_public_link_id", (q) => q.eq("publicLinkId", args.linkId))
        .first();

    if (!jobProfile || jobProfile.status !== "active") {
        throw new Error("Invalid or expired link");
    }

    // Shuffle questions if enabled
    let questionOrder: string[] | undefined = undefined;
    if (jobProfile.shuffleQuestions && jobProfile.questions.length > 0) {
      questionOrder = shuffleArray(jobProfile.questions.map(q => q.id));
    }

    // Create a new interview session
    const interviewId = await ctx.db.insert("interviews", {
        jobProfileId: jobProfile._id,
        interviewerId: jobProfile.interviewerId,
        candidateName: args.candidateName,
        candidateEmail: args.candidateEmail,
        status: "in_progress",
        startedAt: Date.now(),
        questionOrder,
    });

    return interviewId;
  },
});

export const endInterview = mutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.interviewerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.interviewId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const listByJobProfile = query({
  args: { jobProfileId: v.id("jobProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_job_profile", (q) => q.eq("jobProfileId", args.jobProfileId))
      .order("desc")
      .collect();

    return interviews.filter(i => i.interviewerId === userId);
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", userId))
      .order("desc")
      .collect();

    const withProfiles = await Promise.all(
      interviews.map(async (interview) => {
        const jobProfile = await ctx.db.get(interview.jobProfileId);
        const analysis = await ctx.db
            .query("analyses")
            .withIndex("by_interview", (q) => q.eq("interviewId", interview._id))
            .first();

        return {
          ...interview,
          jobTitle: jobProfile?.title || "Unknown",
          overallScore: analysis?.overallScore,
        };
      })
    );

    return withProfiles;
  },
});

export const get = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const interview = await ctx.db.get(args.id);
    
    if (!interview) {
      return null;
    }

    if (userId && interview.interviewerId !== userId) {
      return null;
    }

    const jobProfile = await ctx.db.get(interview.jobProfileId);
    if (!jobProfile) {
      return null;
    }
    
    // Reorder questions if questionOrder exists
    const reorderedQuestions = interview.questionOrder 
      ? reorderQuestions(jobProfile.questions, interview.questionOrder)
      : jobProfile.questions;
    
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.id))
      .collect();

    const responsesWithUrls = await Promise.all(
      responses.map(async (response) => ({
        ...response,
        videoUrl: await ctx.storage.getUrl(response.videoStorageId),
      }))
    );

    const analysis = await ctx.db
      .query("analyses")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.id))
      .first();

    return {
      interview,
      jobProfile: {
        ...jobProfile,
        questions: reorderedQuestions,
      },
      responses: responsesWithUrls,
      analysis,
    };
  },
});

export const completeInterview = internalMutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const markAnalyzed = internalMutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.interviewId, {
      status: "analyzed",
    });
  },
});
