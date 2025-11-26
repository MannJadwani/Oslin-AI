import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveResponse = mutation({
  args: {
    interviewId: v.id("interviews"),
    questionId: v.string(),
    videoStorageId: v.id("_storage"),
    duration: v.number(),
    attemptNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // Delete previous attempts for this question if retaking
    if (args.attemptNumber > 1) {
      const previousResponses = await ctx.db
        .query("responses")
        .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
        .collect();
      
      for (const response of previousResponses) {
        if (response.questionId === args.questionId && response.attemptNumber < args.attemptNumber) {
          await ctx.db.delete(response._id);
        }
      }
    }

    const responseId = await ctx.db.insert("responses", {
      interviewId: args.interviewId,
      questionId: args.questionId,
      videoStorageId: args.videoStorageId,
      duration: args.duration,
      attemptNumber: args.attemptNumber,
    });

    return responseId;
  },
});

export const finalizeInterview = mutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    await ctx.db.patch(args.interviewId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Trigger AI analysis
    await ctx.scheduler.runAfter(0, internal.ai.analyzeInterview, {
      interviewId: args.interviewId,
    });
  },
});

export const listByInterview = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("responses")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .collect();

    return responses;
  },
});
