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

  billingAccounts: defineTable({
    userId: v.id("users"),
    planTier: v.union(
      v.literal("starter"),
      v.literal("growth"),
      v.literal("enterprise")
    ),
    planStatus: v.union(
      v.literal("active"),
      v.literal("grace"),
      v.literal("past_due"),
      v.literal("canceled")
    ),
    monthlyCreditsPerCycle: v.number(),
    monthlyCreditsRemaining: v.number(),
    currentCycleStartAt: v.number(),
    currentCycleEndAt: v.number(),
    graceEndsAt: v.optional(v.number()),
    enterpriseUnlimited: v.boolean(),
    razorpayCustomerId: v.optional(v.string()),
    razorpaySubscriptionId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_plan_status", ["planStatus"])
    .index("by_cycle_end", ["currentCycleEndAt"])
    .index("by_razorpay_subscription", ["razorpaySubscriptionId"]),

  creditBuckets: defineTable({
    userId: v.id("users"),
    sourceType: v.union(
      v.literal("monthly"),
      v.literal("topup"),
      v.literal("adjustment"),
      v.literal("reservation")
    ),
    totalCredits: v.number(),
    remainingCredits: v.number(),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.object({
      note: v.optional(v.string()),
      planTier: v.optional(v.string()),
      packId: v.optional(v.string()),
      interviewId: v.optional(v.id("interviews")),
      reservationType: v.optional(v.union(v.literal("pipeline"), v.literal("analysis_retry"))),
      reservationId: v.optional(v.id("creditReservations")),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_expires_at", ["expiresAt"]),

  creditReservations: defineTable({
    userId: v.id("users"),
    interviewId: v.id("interviews"),
    reservationType: v.union(v.literal("pipeline"), v.literal("analysis_retry")),
    reservedTotal: v.number(),
    remainingReserved: v.number(),
    status: v.union(v.literal("active"), v.literal("released"), v.literal("completed")),
    expiresAt: v.number(),
    metadata: v.optional(v.object({
      reason: v.optional(v.string()),
      attemptId: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_interview", ["interviewId"])
    .index("by_expires_at", ["expiresAt"]),

  billingTransactions: defineTable({
    userId: v.id("users"),
    kind: v.union(
      v.literal("charge"),
      v.literal("reserve"),
      v.literal("release"),
      v.literal("topup"),
      v.literal("reset"),
      v.literal("subscription_renewal"),
      v.literal("manual_adjustment")
    ),
    creditsDelta: v.number(),
    rupeeAmount: v.optional(v.number()),
    currency: v.string(),
    referenceType: v.string(),
    referenceId: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.object({
      note: v.optional(v.string()),
      eventId: v.optional(v.string()),
      planTier: v.optional(v.string()),
      packId: v.optional(v.string()),
      interviewId: v.optional(v.id("interviews")),
      reservationId: v.optional(v.id("creditReservations")),
      attemptId: v.optional(v.string()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  billingWebhookEvents: defineTable({
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    processedAt: v.number(),
    status: v.union(v.literal("processed"), v.literal("ignored"), v.literal("failed")),
    payloadHash: v.string(),
  }).index("by_provider_event", ["provider", "eventId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
