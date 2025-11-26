import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  jobProfiles: defineTable({
    interviewerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    qualifications: v.array(v.string()),
    questions: v.array(v.object({
      id: v.string(),
      text: v.string(),
      timeLimit: v.optional(v.number()), // in seconds, optional
      allowRetake: v.boolean(),
    })),
    status: v.union(v.literal("active"), v.literal("archived")),
  }).index("by_interviewer", ["interviewerId"]),

  interviews: defineTable({
    jobProfileId: v.id("jobProfiles"),
    interviewerId: v.id("users"),
    linkId: v.string(), // unique shareable link identifier
    candidateName: v.optional(v.string()),
    candidateEmail: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("analyzed")
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_link_id", ["linkId"])
    .index("by_job_profile", ["jobProfileId"])
    .index("by_interviewer", ["interviewerId"]),

  responses: defineTable({
    interviewId: v.id("interviews"),
    questionId: v.string(),
    videoStorageId: v.id("_storage"),
    transcript: v.optional(v.string()),
    duration: v.number(), // in seconds
    attemptNumber: v.number(),
  }).index("by_interview", ["interviewId"]),

  analyses: defineTable({
    interviewId: v.id("interviews"),
    overallScore: v.number(), // 0-100
    strengths: v.array(v.string()),
    weaknesses: v.array(v.string()),
    communicationStyle: v.string(),
    confidenceLevel: v.string(),
    skillAlignment: v.string(),
    redFlags: v.array(v.string()),
    summary: v.string(),
    questionAnalyses: v.array(v.object({
      questionId: v.string(),
      score: v.number(),
      feedback: v.string(),
    })),
  }).index("by_interview", ["interviewId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
