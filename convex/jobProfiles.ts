import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    qualifications: v.array(v.string()),
    questions: v.array(v.object({
      id: v.string(),
      text: v.string(),
      timeLimit: v.optional(v.number()),
      allowRetake: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const jobProfileId = await ctx.db.insert("jobProfiles", {
      interviewerId: userId,
      title: args.title,
      description: args.description,
      qualifications: args.qualifications,
      questions: args.questions,
      status: "active",
    });

    return jobProfileId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const profiles = await ctx.db
      .query("jobProfiles")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", userId))
      .order("desc")
      .collect();

    return profiles;
  },
});

export const get = query({
  args: { id: v.id("jobProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const profile = await ctx.db.get(args.id);
    
    if (!profile) {
      return null;
    }

    // Allow access if user is the interviewer or if accessing for interview
    if (userId && profile.interviewerId !== userId) {
      return null;
    }

    return profile;
  },
});

export const update = mutation({
  args: {
    id: v.id("jobProfiles"),
    title: v.string(),
    description: v.string(),
    qualifications: v.array(v.string()),
    questions: v.array(v.object({
      id: v.string(),
      text: v.string(),
      timeLimit: v.optional(v.number()),
      allowRetake: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db.get(args.id);
    if (!profile || profile.interviewerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      qualifications: args.qualifications,
      questions: args.questions,
    });
  },
});

export const archive = mutation({
  args: { id: v.id("jobProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const profile = await ctx.db.get(args.id);
    if (!profile || profile.interviewerId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.id, { status: "archived" });
  },
});
