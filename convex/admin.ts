import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { reserveAnalysisRetryForInterview } from "./billing";

const ADMIN_ROLE_KEYS = ["it_admin", "support_admin", "super_admin"] as const;
type AdminRoleKey = (typeof ADMIN_ROLE_KEYS)[number];

const ROLE_DEFINITIONS: ReadonlyArray<{
  key: AdminRoleKey;
  label: string;
  description: string;
}> = [
  {
    key: "it_admin",
    label: "IT Admin",
    description: "Operational access for billing and platform maintenance.",
  },
  {
    key: "support_admin",
    label: "Support Admin",
    description: "Support-only access for interview troubleshooting.",
  },
  {
    key: "super_admin",
    label: "Super Admin",
    description: "Full administrative control, including role management.",
  },
];

function isAdminRoleKey(value: string): value is AdminRoleKey {
  return (ADMIN_ROLE_KEYS as readonly string[]).includes(value);
}

function normalizeSearch(search?: string): string {
  return (search ?? "").trim().toLowerCase();
}

async function getRoleKeysForUser(
  db: {
    get: (id: Id<"roles">) => Promise<Doc<"roles"> | null>;
    query: any;
  },
  userId: Id<"users">,
): Promise<AdminRoleKey[]> {
  const assignments: Array<Doc<"userRoles">> = await db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const keys: AdminRoleKey[] = [];
  for (const assignment of assignments) {
    const role = await db.get(assignment.roleId);
    if (role && isAdminRoleKey(role.key)) {
      keys.push(role.key);
    }
  }
  return keys;
}

async function requireAdminRole(
  ctx: { db: any },
  userId: Id<"users">,
  allowed: ReadonlyArray<AdminRoleKey> = ADMIN_ROLE_KEYS,
): Promise<AdminRoleKey[]> {
  const keys = await getRoleKeysForUser(ctx.db, userId);
  if (!keys.some((key) => allowed.includes(key))) {
    throw new Error("Not authorized: admin role required");
  }
  return keys;
}

async function getSuspensionFlag(
  ctx: { db: any },
  userId: Id<"users">,
): Promise<Doc<"userAccountFlags"> | null> {
  return await ctx.db
    .query("userAccountFlags")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
}

async function ensureRole(
  ctx: { db: any },
  roleKey: AdminRoleKey,
): Promise<Doc<"roles">> {
  const existing = await ctx.db
    .query("roles")
    .withIndex("by_key", (q: any) => q.eq("key", roleKey))
    .first();

  if (existing) {
    return existing;
  }

  const definition = ROLE_DEFINITIONS.find((item) => item.key === roleKey);
  if (!definition) {
    throw new Error(`Invalid role: ${roleKey}`);
  }

  const roleId = await ctx.db.insert("roles", {
    key: definition.key,
    label: definition.label,
    description: definition.description,
    createdAt: Date.now(),
  });

  const created = await ctx.db.get(roleId);
  if (!created) {
    throw new Error("Failed to create role");
  }
  return created;
}

async function ensureAllRoles(ctx: { db: any }): Promise<void> {
  for (const definition of ROLE_DEFINITIONS) {
    await ensureRole(ctx, definition.key);
  }
}

async function writeAdminAuditLog(
  ctx: { db: any },
  args: {
    actorUserId: Id<"users">;
    action: string;
    targetType: string;
    targetId: string;
    reason?: string;
    before?: any;
    after?: any;
    metadata?: any;
  },
): Promise<void> {
  await ctx.db.insert("adminAuditLogs", {
    actorUserId: args.actorUserId,
    action: args.action,
    targetType: args.targetType,
    targetId: args.targetId,
    reason: args.reason,
    before: args.before,
    after: args.after,
    metadata: args.metadata,
    createdAt: Date.now(),
  });
}

async function sumCreditsByType(
  ctx: { db: any },
  userId: Id<"users">,
): Promise<{ monthly: number; topup: number; adjustment: number; total: number }> {
  const buckets: Array<Doc<"creditBuckets">> = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  let monthly = 0;
  let topup = 0;
  let adjustment = 0;
  let total = 0;

  for (const bucket of buckets) {
    if (bucket.sourceType === "reservation") {
      continue;
    }

    total += bucket.remainingCredits;
    if (bucket.sourceType === "monthly") {
      monthly += bucket.remainingCredits;
    } else if (bucket.sourceType === "topup") {
      topup += bucket.remainingCredits;
    } else if (bucket.sourceType === "adjustment") {
      adjustment += bucket.remainingCredits;
    }
  }

  return { monthly, topup, adjustment, total };
}

async function syncMonthlyRemaining(
  ctx: { db: any },
  userId: Id<"users">,
): Promise<void> {
  const account: Doc<"billingAccounts"> | null = await ctx.db
    .query("billingAccounts")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!account) {
    return;
  }

  const buckets: Array<Doc<"creditBuckets">> = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const monthlyRemaining = buckets
    .filter((bucket) => bucket.sourceType === "monthly")
    .reduce((sum, bucket) => sum + bucket.remainingCredits, 0);

  if (monthlyRemaining !== account.monthlyCreditsRemaining) {
    await ctx.db.patch(account._id, {
      monthlyCreditsRemaining: monthlyRemaining,
      updatedAt: Date.now(),
    });
  }
}

async function deductCreditsEarliestExpiry(
  ctx: { db: any },
  userId: Id<"users">,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    return;
  }

  const buckets: Array<Doc<"creditBuckets">> = (
    await ctx.db
      .query("creditBuckets")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect()
  )
    .filter(
      (bucket: Doc<"creditBuckets">) =>
        bucket.sourceType !== "reservation" &&
        bucket.remainingCredits > 0,
    )
    .sort((a: Doc<"creditBuckets">, b: Doc<"creditBuckets">) => {
      const aExpiry = a.expiresAt ?? Number.MAX_SAFE_INTEGER;
      const bExpiry = b.expiresAt ?? Number.MAX_SAFE_INTEGER;
      return aExpiry - bExpiry;
    });

  let remaining = amount;
  for (const bucket of buckets) {
    if (remaining <= 0) {
      break;
    }
    const consume = Math.min(bucket.remainingCredits, remaining);
    await ctx.db.patch(bucket._id, {
      remainingCredits: bucket.remainingCredits - consume,
    });
    remaining -= consume;
  }

  if (remaining > 0) {
    throw new Error("Insufficient credits for adjustment");
  }
}

export const bootstrapAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ensureAllRoles(ctx);

    const currentAssignments: Array<Doc<"userRoles">> = await ctx.db
      .query("userRoles")
      .collect();

    if (currentAssignments.length > 0) {
      const myRoles = await getRoleKeysForUser(ctx.db, userId);
      if (!myRoles.includes("super_admin")) {
        throw new Error("Bootstrap unavailable: admin roles already initialized");
      }
      return { alreadyBootstrapped: true, role: "super_admin" as const };
    }

    const initialEmail = process.env.INITIAL_ADMIN_EMAIL;
    if (initialEmail) {
      const user = await ctx.db.get(userId);
      const normalizedCurrent = String(user?.email ?? "").toLowerCase();
      const normalizedRequired = initialEmail.toLowerCase();
      if (normalizedCurrent !== normalizedRequired) {
        throw new Error("Current account does not match INITIAL_ADMIN_EMAIL");
      }
    }

    const superAdminRole = await ensureRole(ctx, "super_admin");
    await ctx.db.insert("userRoles", {
      userId,
      roleId: superAdminRole._id,
      assignedAt: Date.now(),
      assignedBy: userId,
    });

    await writeAdminAuditLog(ctx, {
      actorUserId: userId,
      action: "bootstrap_admin_role",
      targetType: "user",
      targetId: String(userId),
      reason: "Initial admin bootstrap",
      after: { role: "super_admin" },
    });

    return { alreadyBootstrapped: false, role: "super_admin" as const };
  },
});

export const getMyAdminContext = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        roleKeys: [] as AdminRoleKey[],
        isSuspended: false,
      };
    }

    const roleKeys = await getRoleKeysForUser(ctx.db, userId);
    const suspension = await getSuspensionFlag(ctx, userId);

    return {
      isAuthenticated: true,
      isAdmin: roleKeys.length > 0,
      roleKeys,
      isSuspended: suspension?.isSuspended ?? false,
      suspensionReason: suspension?.reason,
    };
  },
});

export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, userId);

    const [
      users,
      interviews,
      billingAccounts,
      failedWebhooks,
      suspendedFlags,
      auditLogs,
    ] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("interviews").collect(),
      ctx.db.query("billingAccounts").collect(),
      ctx.db.query("billingWebhookEvents").collect(),
      ctx.db.query("userAccountFlags").collect(),
      ctx.db.query("adminAuditLogs").collect(),
    ]);

    const failedWebhookCount = failedWebhooks.filter(
      (event) => event.status === "failed",
    ).length;

    const graceCount = billingAccounts.filter(
      (account) => account.planStatus === "grace",
    ).length;

    const suspendedCount = suspendedFlags.filter((flag) => flag.isSuspended)
      .length;

    return {
      users: users.length,
      interviews: interviews.length,
      billingAccounts: billingAccounts.length,
      failedWebhookCount,
      graceCount,
      suspendedCount,
      adminActionsLast7d: auditLogs.filter(
        (log) => log.createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).length,
    };
  },
});

export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, userId);

    const search = normalizeSearch(args.search);
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 250);

    const users: Array<Doc<"users">> = await ctx.db.query("users").collect();

    const filtered = users.filter((user) => {
      if (!search) {
        return true;
      }
      const email = String(user.email ?? "").toLowerCase();
      const name = String(user.name ?? "").toLowerCase();
      return email.includes(search) || name.includes(search);
    });

    const sliced = filtered
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);

    return await Promise.all(
      sliced.map(async (user) => {
        const [roles, suspension, billingAccount, credits, interviewCount] =
          await Promise.all([
            getRoleKeysForUser(ctx.db, user._id),
            getSuspensionFlag(ctx, user._id),
            ctx.db
              .query("billingAccounts")
              .withIndex("by_user", (q: any) => q.eq("userId", user._id))
              .first(),
            sumCreditsByType(ctx, user._id),
            ctx.db
              .query("interviews")
              .withIndex("by_interviewer", (q: any) =>
                q.eq("interviewerId", user._id),
              )
              .collect(),
          ]);

        return {
          userId: user._id,
          email: user.email,
          name: user.name,
          createdAt: user._creationTime,
          roles,
          isSuspended: suspension?.isSuspended ?? false,
          suspensionReason: suspension?.reason,
          billing: billingAccount
            ? {
                planTier: billingAccount.planTier,
                planStatus: billingAccount.planStatus,
                monthlyCreditsRemaining: billingAccount.monthlyCreditsRemaining,
              }
            : null,
          credits,
          interviewCount: interviewCount.length,
        };
      }),
    );
  },
});

export const getUserDetails = query({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, userId);

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      return null;
    }

    const [roles, suspension, billingAccount, credits, transactions] =
      await Promise.all([
        getRoleKeysForUser(ctx.db, args.targetUserId),
        getSuspensionFlag(ctx, args.targetUserId),
        ctx.db
          .query("billingAccounts")
          .withIndex("by_user", (q: any) => q.eq("userId", args.targetUserId))
          .first(),
        sumCreditsByType(ctx, args.targetUserId),
        ctx.db
          .query("billingTransactions")
          .withIndex("by_user_created", (q: any) =>
            q.eq("userId", args.targetUserId),
          )
          .order("desc")
          .take(30),
      ]);

    return {
      user: {
        userId: targetUser._id,
        email: targetUser.email,
        name: targetUser.name,
        createdAt: targetUser._creationTime,
      },
      roles,
      suspension,
      billingAccount,
      credits,
      recentTransactions: transactions,
    };
  },
});

export const setUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    roleKey: v.string(),
    enabled: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isAdminRoleKey(args.roleKey)) {
      throw new Error("Invalid role key");
    }

    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, actorUserId, ["super_admin"]);

    await ensureAllRoles(ctx);

    const role = await ensureRole(ctx, args.roleKey);
    const existingAssignments: Array<Doc<"userRoles">> = await ctx.db
      .query("userRoles")
      .withIndex("by_user_role", (q: any) =>
        q.eq("userId", args.targetUserId).eq("roleId", role._id),
      )
      .collect();

    const existing = existingAssignments[0] ?? null;

    if (args.enabled && !existing) {
      await ctx.db.insert("userRoles", {
        userId: args.targetUserId,
        roleId: role._id,
        assignedAt: Date.now(),
        assignedBy: actorUserId,
      });
    }

    if (!args.enabled && existing) {
      await ctx.db.delete(existing._id);
    }

    const updatedRoles = await getRoleKeysForUser(ctx.db, args.targetUserId);

    await writeAdminAuditLog(ctx, {
      actorUserId,
      action: "set_user_role",
      targetType: "user",
      targetId: String(args.targetUserId),
      reason: args.reason,
      before: { hadRole: Boolean(existing), roleKey: args.roleKey },
      after: { enabled: args.enabled, roles: updatedRoles },
    });

    return { roles: updatedRoles };
  },
});

export const setUserSuspended = mutation({
  args: {
    targetUserId: v.id("users"),
    isSuspended: v.boolean(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, actorUserId, ["it_admin", "super_admin"]);

    const existing = await getSuspensionFlag(ctx, args.targetUserId);

    if (existing) {
      await ctx.db.patch(existing._id, {
        isSuspended: args.isSuspended,
        reason: args.reason,
        updatedAt: Date.now(),
        updatedBy: actorUserId,
      });
    } else {
      await ctx.db.insert("userAccountFlags", {
        userId: args.targetUserId,
        isSuspended: args.isSuspended,
        reason: args.reason,
        updatedAt: Date.now(),
        updatedBy: actorUserId,
      });
    }

    await writeAdminAuditLog(ctx, {
      actorUserId,
      action: "set_user_suspended",
      targetType: "user",
      targetId: String(args.targetUserId),
      reason: args.reason,
      before: existing
        ? {
            isSuspended: existing.isSuspended,
            reason: existing.reason,
          }
        : null,
      after: {
        isSuspended: args.isSuspended,
        reason: args.reason,
      },
    });

    return { isSuspended: args.isSuspended };
  },
});

export const getBillingUserState = query({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, actorUserId, ["it_admin", "super_admin"]);

    const [billingAccount, credits, transactions, reservations] = await Promise.all([
      ctx.db
        .query("billingAccounts")
        .withIndex("by_user", (q: any) => q.eq("userId", args.targetUserId))
        .first(),
      sumCreditsByType(ctx, args.targetUserId),
      ctx.db
        .query("billingTransactions")
        .withIndex("by_user_created", (q: any) =>
          q.eq("userId", args.targetUserId),
        )
        .order("desc")
        .take(50),
      ctx.db
        .query("creditReservations")
        .withIndex("by_user", (q: any) => q.eq("userId", args.targetUserId))
        .collect(),
    ]);

    return {
      billingAccount,
      credits,
      transactions,
      activeReservations: reservations.filter((r) => r.status === "active"),
    };
  },
});

export const adjustCredits = mutation({
  args: {
    targetUserId: v.id("users"),
    creditsDelta: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.creditsDelta === 0) {
      throw new Error("creditsDelta must be non-zero");
    }

    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId, ["it_admin", "super_admin"]);

    const before = await sumCreditsByType(ctx, args.targetUserId);

    if (args.creditsDelta > 0) {
      await ctx.db.insert("creditBuckets", {
        userId: args.targetUserId,
        sourceType: "adjustment",
        totalCredits: args.creditsDelta,
        remainingCredits: args.creditsDelta,
        metadata: {
          note: `Admin adjustment: ${args.reason}`,
        },
      });
    } else {
      await deductCreditsEarliestExpiry(ctx, args.targetUserId, Math.abs(args.creditsDelta));
    }

    await ctx.db.insert("billingTransactions", {
      userId: args.targetUserId,
      kind: "manual_adjustment",
      creditsDelta: args.creditsDelta,
      currency: "INR",
      referenceType: "admin_adjustment",
      referenceId: `${actorUserId}:${Date.now()}`,
      createdAt: Date.now(),
      metadata: {
        note: args.reason,
      },
    });

    await syncMonthlyRemaining(ctx, args.targetUserId);

    const after = await sumCreditsByType(ctx, args.targetUserId);

    await writeAdminAuditLog(ctx, {
      actorUserId,
      action: "adjust_credits",
      targetType: "user",
      targetId: String(args.targetUserId),
      reason: args.reason,
      before,
      after,
      metadata: {
        creditsDelta: args.creditsDelta,
      },
    });

    return { before, after };
  },
});

export const runBillingJob = mutation({
  args: {
    job: v.union(
      v.literal("cycle_reset"),
      v.literal("expire_topups"),
      v.literal("expire_stale_reservations"),
      v.literal("enforce_grace_downgrade"),
    ),
    reason: v.string(),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId, ["it_admin", "super_admin"]);

    if (args.dryRun) {
      const preview = {
        billingAccounts: (await ctx.db.query("billingAccounts").collect()).length,
        topupBuckets: (await ctx.db.query("creditBuckets").collect()).filter(
          (bucket) => bucket.sourceType === "topup",
        ).length,
        activeReservations: (await ctx.db.query("creditReservations").collect()).filter(
          (reservation) => reservation.status === "active",
        ).length,
      };

      return { dryRun: true, job: args.job, preview };
    }

    const now = Date.now();
    if (args.job === "cycle_reset") {
      await ctx.runMutation(internal.billing.runCycleReset, { now });
    } else if (args.job === "expire_topups") {
      await ctx.runMutation(internal.billing.expireTopups, { now });
    } else if (args.job === "expire_stale_reservations") {
      await ctx.runMutation(internal.billing.expireStaleReservations, { now });
    } else {
      await ctx.runMutation(internal.billing.enforceGraceDowngrade, { now });
    }

    await writeAdminAuditLog(ctx, {
      actorUserId,
      action: "run_billing_job",
      targetType: "system",
      targetId: args.job,
      reason: args.reason,
      metadata: { dryRun: false },
    });

    return { dryRun: false, job: args.job, ranAt: now };
  },
});

export const listInterviewsGlobal = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("analyzed"),
      ),
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId);

    const limit = Math.min(Math.max(args.limit ?? 100, 1), 250);
    const search = normalizeSearch(args.search);

    let interviews: Array<Doc<"interviews">> = await ctx.db.query("interviews").collect();

    if (args.status) {
      interviews = interviews.filter((interview) => interview.status === args.status);
    }

    interviews = interviews.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));

    const filtered = interviews.filter((interview) => {
      if (!search) {
        return true;
      }
      const candidateName = String(interview.candidateName ?? "").toLowerCase();
      const candidateEmail = String(interview.candidateEmail ?? "").toLowerCase();
      return candidateName.includes(search) || candidateEmail.includes(search);
    });

    return await Promise.all(
      filtered.slice(0, limit).map(async (interview) => {
        const [jobProfile, analysis] = await Promise.all([
          ctx.db.get(interview.jobProfileId),
          ctx.db
            .query("analyses")
            .withIndex("by_interview", (q: any) => q.eq("interviewId", interview._id))
            .first(),
        ]);

        return {
          interviewId: interview._id,
          interviewerId: interview.interviewerId,
          status: interview.status,
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          startedAt: interview.startedAt,
          completedAt: interview.completedAt,
          jobTitle: jobProfile?.title,
          overallScore: analysis?.overallScore,
        };
      }),
    );
  },
});

export const retryInterviewAnalysis = mutation({
  args: {
    interviewId: v.id("interviews"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId, [
      "support_admin",
      "it_admin",
      "super_admin",
    ]);

    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.status !== "completed" && interview.status !== "analyzed") {
      throw new Error("Interview must be completed before analysis retry");
    }

    const attemptId = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await reserveAnalysisRetryForInterview(
      ctx,
      interview.interviewerId,
      interview._id,
      attemptId,
    );

    await ctx.scheduler.runAfter(0, internal.ai.analyzeInterview, {
      interviewId: interview._id,
      attemptId,
    });

    await writeAdminAuditLog(ctx, {
      actorUserId,
      action: "retry_interview_analysis",
      targetType: "interview",
      targetId: String(args.interviewId),
      reason: args.reason,
      metadata: {
        attemptId,
        interviewerId: interview.interviewerId,
      },
    });

    return { queued: true, attemptId };
  },
});

export const listWebhookFailures = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId);

    const limit = Math.min(Math.max(args.limit ?? 100, 1), 300);
    const events: Array<Doc<"billingWebhookEvents">> = await ctx.db
      .query("billingWebhookEvents")
      .collect();

    return events
      .filter((event) => event.status === "failed")
      .sort((a, b) => b.processedAt - a.processedAt)
      .slice(0, limit);
  },
});

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }
    await requireAdminRole(ctx, actorUserId);

    const [failedWebhookEvents, graceAccounts, suspendedFlags] = await Promise.all([
      ctx.db.query("billingWebhookEvents").collect(),
      ctx.db.query("billingAccounts").collect(),
      ctx.db.query("userAccountFlags").collect(),
    ]);

    return {
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
      razorpayEnabled: process.env.RAZORPAY_ENABLED === "true",
      billingEnforcementEnabled:
        process.env.BILLING_ENFORCEMENT_ENABLED === "true",
      failedWebhooks: failedWebhookEvents.filter((e) => e.status === "failed")
        .length,
      accountsInGrace: graceAccounts.filter((account) => account.planStatus === "grace")
        .length,
      suspendedUsers: suspendedFlags.filter((flag) => flag.isSuspended).length,
    };
  },
});

export const listAuditLogs = query({
  args: {
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actorUserId = await getAuthUserId(ctx);
    if (!actorUserId) {
      throw new Error("Not authenticated");
    }

    await requireAdminRole(ctx, actorUserId);

    const limit = Math.min(Math.max(args.limit ?? 30, 1), 100);

    const queryWithCursor = args.cursor
      ? ctx.db
          .query("adminAuditLogs")
          .withIndex("by_created_at", (q: any) => q.lt("createdAt", args.cursor as number))
      : ctx.db.query("adminAuditLogs").withIndex("by_created_at", (q: any) => q);

    const page: Array<Doc<"adminAuditLogs">> = await queryWithCursor
      .order("desc")
      .take(limit + 1);

    const hasMore = page.length > limit;
    const items = hasMore ? page.slice(0, limit) : page;
    const nextCursor = hasMore ? items[items.length - 1]?.createdAt ?? null : null;

    return {
      items,
      hasMore,
      nextCursor,
    };
  },
});
