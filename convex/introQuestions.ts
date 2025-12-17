import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get intro questions for the current user
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const introQuestions = await ctx.db
      .query("introQuestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return introQuestions;
  },
});

// Get intro questions by interviewer ID (for candidates)
export const getByInterviewer = query({
  args: { interviewerId: v.id("users") },
  handler: async (ctx, args) => {
    const introQuestions = await ctx.db
      .query("introQuestions")
      .withIndex("by_user", (q) => q.eq("userId", args.interviewerId))
      .first();

    return introQuestions?.questions ?? [];
  },
});

// Save/update intro questions
export const save = mutation({
  args: {
    questions: v.array(v.object({
      id: v.string(),
      text: v.string(),
      timeLimit: v.optional(v.number()),
      allowRetake: v.boolean(),
      elaborateText: v.optional(v.string()),
      elaborateExtensionSeconds: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has intro questions
    const existing = await ctx.db
      .query("introQuestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        questions: args.questions,
      });
      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert("introQuestions", {
        userId,
        questions: args.questions,
      });
      return id;
    }
  },
});




