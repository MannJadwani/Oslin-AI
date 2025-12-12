import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generatePublicLinkId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

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
    shuffleQuestions: v.optional(v.boolean()),
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
      publicLinkId: generatePublicLinkId(),
      shuffleQuestions: args.shuffleQuestions ?? false,
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

    // Allow access if user is the interviewer
    if (userId && profile.interviewerId !== userId) {
      return null;
    }

    return profile;
  },
});

export const getByPublicLink = query({
  args: { publicLinkId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("jobProfiles")
      .withIndex("by_public_link_id", (q) => q.eq("publicLinkId", args.publicLinkId))
      .first();
    
    if (!profile || profile.status === "archived") {
      return null;
    }

    // Publicly accessible, but filter out sensitive internal info if any (none for now)
    return {
      _id: profile._id,
      title: profile.title,
      description: profile.description,
      questions: profile.questions,
      qualifications: profile.qualifications,
    };
  },
});

export const generatePublicLinkIfMissing = mutation({
  args: { id: v.id("jobProfiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const profile = await ctx.db.get(args.id);
    if (!profile || profile.interviewerId !== userId) throw new Error("Unauthorized");
    
    if (!profile.publicLinkId) {
      const publicLinkId = generatePublicLinkId();
      await ctx.db.patch(args.id, { publicLinkId });
      return publicLinkId;
    }
    return profile.publicLinkId;
  }
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
    shuffleQuestions: v.optional(v.boolean()),
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
      shuffleQuestions: args.shuffleQuestions ?? false,
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
