import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Global intro questions that start every interview (per user)
  introQuestions: defineTable({
    userId: v.id("users"),
    questions: v.array(v.object({
      id: v.string(),
      text: v.string(),
      timeLimit: v.optional(v.number()), // in seconds, optional
      allowRetake: v.boolean(),
      elaborateText: v.optional(v.string()), // Additional explanation text for "Please elaborate"
      elaborateExtensionSeconds: v.optional(v.number()), // Seconds to add when "Please elaborate" is clicked (default 10)
    })),
  }).index("by_user", ["userId"]),

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
      elaborateText: v.optional(v.string()), // Additional explanation text for "Please elaborate"
      elaborateExtensionSeconds: v.optional(v.number()), // Seconds to add when "Please elaborate" is clicked (default 10)
    })),
    faq: v.optional(v.array(v.object({
      id: v.string(),
      question: v.string(),
      answer: v.string(),
    }))), // Post-interview FAQ items
    status: v.union(v.literal("active"), v.literal("archived")),
    publicLinkId: v.optional(v.string()), // For sharing public links
    shuffleQuestions: v.optional(v.boolean()), // Shuffle questions for each new candidate
  })
    .index("by_interviewer", ["interviewerId"])
    .index("by_public_link_id", ["publicLinkId"]),

  interviews: defineTable({
    jobProfileId: v.id("jobProfiles"),
    interviewerId: v.id("users"),
    linkId: v.optional(v.string()), // Keeping for backward compatibility or unique invites
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
    questionOrder: v.optional(v.array(v.string())), // Shuffled order of question IDs for this interview
  })
    .index("by_link_id", ["linkId"])
    .index("by_job_profile", ["jobProfileId"])
    .index("by_interviewer", ["interviewerId"]),

  responses: defineTable({
    interviewId: v.id("interviews"),
    questionId: v.string(),
    // Support both single file (legacy) and chunked storage
    videoStorageId: v.optional(v.id("_storage")), // Single file (legacy)
    videoChunkIds: v.optional(v.array(v.id("_storage"))), // Chunked storage (new)
    transcript: v.optional(v.string()),
    duration: v.number(), // in seconds
    attemptNumber: v.number(),
  }).index("by_interview", ["interviewId"]),

  // Temporary chunk storage during recording
  videoChunks: defineTable({
    interviewId: v.id("interviews"),
    questionId: v.string(),
    chunkIndex: v.number(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
  })
    .index("by_interview_question", ["interviewId", "questionId"])
    .index("by_interview_question_index", ["interviewId", "questionId", "chunkIndex"]),

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
