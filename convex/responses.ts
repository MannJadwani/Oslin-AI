import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Video response storage - supports both single file (legacy) and chunked uploads

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save a single chunk during progressive upload
export const saveChunk = mutation({
  args: {
    interviewId: v.id("interviews"),
    questionId: v.string(),
    chunkIndex: v.number(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // Check if chunk already exists (idempotency)
    const existing = await ctx.db
      .query("videoChunks")
      .withIndex("by_interview_question_index", (q) => 
        q.eq("interviewId", args.interviewId)
         .eq("questionId", args.questionId)
         .eq("chunkIndex", args.chunkIndex)
      )
      .unique();

    if (existing) {
      // Replace existing chunk
      await ctx.db.patch(existing._id, {
        storageId: args.storageId,
        uploadedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("videoChunks", {
      interviewId: args.interviewId,
      questionId: args.questionId,
      chunkIndex: args.chunkIndex,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });
  },
});

// Finalize a chunked response - collect all chunks and create the response
export const finalizeChunkedResponse = mutation({
  args: {
    interviewId: v.id("interviews"),
    questionId: v.string(),
    duration: v.number(),
    attemptNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    // Get all chunks for this question, ordered by index
    const chunks = await ctx.db
      .query("videoChunks")
      .withIndex("by_interview_question", (q) => 
        q.eq("interviewId", args.interviewId)
         .eq("questionId", args.questionId)
      )
      .collect();

    // Sort by chunk index
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

    if (chunks.length === 0) {
      throw new Error("No chunks found for this response");
    }

    // Extract storage IDs in order
    const videoChunkIds: Array<Id<"_storage">> = chunks.map(c => c.storageId);

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

    // Create the response with chunk IDs
    const responseId = await ctx.db.insert("responses", {
      interviewId: args.interviewId,
      questionId: args.questionId,
      videoChunkIds,
      duration: args.duration,
      attemptNumber: args.attemptNumber,
    });

    // Clean up chunk records (storage files remain)
    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    return responseId;
  },
});

// Legacy: Save a single-file response (kept for backward compatibility)
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

// Get video URLs for a response (handles both single file and chunked)
export const getVideoUrls = query({
  args: { responseId: v.id("responses") },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.responseId);
    if (!response) {
      return null;
    }

    // Chunked video
    if (response.videoChunkIds && response.videoChunkIds.length > 0) {
      const urls: Array<string | null> = [];
      for (const chunkId of response.videoChunkIds) {
        const url = await ctx.storage.getUrl(chunkId);
        urls.push(url);
      }
      return { type: "chunked" as const, urls };
    }

    // Single file (legacy)
    if (response.videoStorageId) {
      const url = await ctx.storage.getUrl(response.videoStorageId);
      return { type: "single" as const, url };
    }

    return null;
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
