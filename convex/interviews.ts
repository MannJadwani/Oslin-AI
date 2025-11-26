import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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

export const getByLink = query({
  args: { linkId: v.string() },
  handler: async (ctx, args) => {
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_link_id", (q) => q.eq("linkId", args.linkId))
      .first();

    if (!interview) {
      return null;
    }

    const jobProfile = await ctx.db.get(interview.jobProfileId);
    
    return {
      interview,
      jobProfile,
    };
  },
});

export const startInterview = mutation({
  args: {
    linkId: v.string(),
    candidateName: v.string(),
    candidateEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_link_id", (q) => q.eq("linkId", args.linkId))
      .first();

    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.status !== "pending") {
      throw new Error("Interview already started");
    }

    await ctx.db.patch(interview._id, {
      candidateName: args.candidateName,
      candidateEmail: args.candidateEmail,
      status: "in_progress",
      startedAt: Date.now(),
    });

    return interview._id;
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
        return {
          ...interview,
          jobTitle: jobProfile?.title || "Unknown",
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
      jobProfile,
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
