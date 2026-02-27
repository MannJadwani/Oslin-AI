import { v } from "convex/values";
import {
  action,
  internalMutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

const CREDIT_COSTS = {
  start: 1,
  finalize: 2,
  analysis: 1,
} as const;

const PIPELINE_TOTAL_COST =
  CREDIT_COSTS.start + CREDIT_COSTS.finalize + CREDIT_COSTS.analysis;

const PLAN_CREDITS = {
  starter: 25,
  growth: 250,
  enterprise: 0,
} as const;

const GROWTH_PRICE_INR = 6499;
const TOPUP_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000;
const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
const PIPELINE_RESERVATION_MS = 7 * 24 * 60 * 60 * 1000;
const ANALYSIS_RETRY_RESERVATION_MS = 2 * 24 * 60 * 60 * 1000;

const TOPUP_PACKS = [
  { id: "pack_100", label: "100 Credits", amountInr: 499, credits: 100 },
  { id: "pack_250", label: "250 Credits", amountInr: 999, credits: 250 },
  { id: "pack_600", label: "600 Credits", amountInr: 1999, credits: 600 },
] as const;

type PlanTier = "starter" | "growth" | "enterprise";
type ReservationType = "pipeline" | "analysis_retry";

function isBillingEnforced(): boolean {
  return process.env.BILLING_ENFORCEMENT_ENABLED === "true";
}

function isRazorpayEnabled(): boolean {
  return process.env.RAZORPAY_ENABLED === "true";
}

function toBase64(input: string): string {
  if (typeof btoa === "function") {
    return btoa(input);
  }
  return Buffer.from(input).toString("base64");
}

function addOneMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return date.getTime();
}

function resolveCurrentCycle(anchorTimestamp: number, now: number): {
  start: number;
  end: number;
} {
  let start = anchorTimestamp;
  let end = addOneMonth(start);
  while (now >= end) {
    start = end;
    end = addOneMonth(start);
  }
  return { start, end };
}

function ensurePlanTier(
  tier: string | undefined,
): PlanTier {
  if (tier === "growth" || tier === "enterprise") {
    return tier;
  }
  return "starter";
}

function inferMonthlyCredits(planTier: PlanTier): number {
  return PLAN_CREDITS[planTier];
}

function normalizeReservationReference(
  interviewId: Id<"interviews">,
  attemptId?: string,
): string {
  if (attemptId) {
    return `${interviewId}:${attemptId}`;
  }
  return `${interviewId}:pipeline`;
}

function throwInsufficientCredits(required: number, available: number): never {
  throw new Error(
    `BILLING_INSUFFICIENT_CREDITS: required=${required} available=${available}. Please add credits or upgrade your plan.`,
  );
}

async function getBillingAccountByUser(
  ctx: Pick<MutationCtx, "db">,
  userId: Id<"users">,
): Promise<Doc<"billingAccounts"> | null> {
  return await ctx.db
    .query("billingAccounts")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

async function sumMonthlyRemaining(
  ctx: Pick<MutationCtx, "db">,
  userId: Id<"users">,
): Promise<number> {
  const buckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return buckets
    .filter((bucket) => bucket.sourceType === "monthly")
    .reduce((total, bucket) => total + bucket.remainingCredits, 0);
}

async function syncAccountMonthlyRemaining(
  ctx: MutationCtx,
  account: Doc<"billingAccounts">,
): Promise<void> {
  const monthlyCreditsRemaining = await sumMonthlyRemaining(ctx, account.userId);
  if (monthlyCreditsRemaining !== account.monthlyCreditsRemaining) {
    await ctx.db.patch(account._id, {
      monthlyCreditsRemaining,
      updatedAt: Date.now(),
    });
  }
}

async function insertTransaction(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    kind:
      | "charge"
      | "reserve"
      | "release"
      | "topup"
      | "reset"
      | "subscription_renewal"
      | "manual_adjustment";
    creditsDelta: number;
    referenceType: string;
    referenceId: string;
    rupeeAmount?: number;
    metadata?: {
      note?: string;
      eventId?: string;
      planTier?: string;
      packId?: string;
      interviewId?: Id<"interviews">;
      reservationId?: Id<"creditReservations">;
      attemptId?: string;
    };
  },
): Promise<void> {
  await ctx.db.insert("billingTransactions", {
    userId: args.userId,
    kind: args.kind,
    creditsDelta: args.creditsDelta,
    rupeeAmount: args.rupeeAmount,
    currency: "INR",
    referenceType: args.referenceType,
    referenceId: args.referenceId,
    createdAt: Date.now(),
    metadata: args.metadata,
  });
}

async function getCreditState(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<{
  spendableCredits: number;
  reservedCredits: number;
  availableCredits: number;
  topupRemaining: number;
  activeReservations: Array<Doc<"creditReservations">>;
}> {
  const buckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  const activeReservations = (
    await ctx.db
      .query("creditReservations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  ).filter((reservation) => reservation.status === "active");

  const spendableCredits = buckets
    .filter((bucket) => bucket.sourceType !== "reservation")
    .reduce((total, bucket) => total + bucket.remainingCredits, 0);

  const topupRemaining = buckets
    .filter((bucket) => bucket.sourceType === "topup")
    .reduce((total, bucket) => total + bucket.remainingCredits, 0);

  const reservedCredits = activeReservations.reduce(
    (total, reservation) => total + reservation.remainingReserved,
    0,
  );

  return {
    spendableCredits,
    reservedCredits,
    availableCredits: Math.max(0, spendableCredits - reservedCredits),
    topupRemaining,
    activeReservations,
  };
}

async function debitSpendableBuckets(
  ctx: MutationCtx,
  userId: Id<"users">,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    return;
  }

  const buckets = (
    await ctx.db
      .query("creditBuckets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
  )
    .filter(
      (bucket) =>
        bucket.sourceType !== "reservation" &&
        bucket.remainingCredits > 0,
    )
    .sort((a, b) => {
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
    throwInsufficientCredits(amount, amount - remaining);
  }
}

async function ensureMonthlyBucketForCycle(
  ctx: MutationCtx,
  account: Doc<"billingAccounts">,
  cycleStart: number,
  cycleEnd: number,
  transactionKind: "reset" | "subscription_renewal",
  note: string,
): Promise<void> {
  const userBuckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_user", (q) => q.eq("userId", account.userId))
    .collect();

  for (const bucket of userBuckets) {
    if (bucket.sourceType === "monthly" && bucket.remainingCredits > 0) {
      await ctx.db.patch(bucket._id, { remainingCredits: 0 });
    }
  }

  if (!account.enterpriseUnlimited && account.monthlyCreditsPerCycle > 0) {
    await ctx.db.insert("creditBuckets", {
      userId: account.userId,
      sourceType: "monthly",
      totalCredits: account.monthlyCreditsPerCycle,
      remainingCredits: account.monthlyCreditsPerCycle,
      expiresAt: cycleEnd,
      metadata: {
        note,
        planTier: account.planTier,
      },
    });
  }

  await ctx.db.patch(account._id, {
    currentCycleStartAt: cycleStart,
    currentCycleEndAt: cycleEnd,
    monthlyCreditsRemaining: account.enterpriseUnlimited
      ? account.monthlyCreditsRemaining
      : account.monthlyCreditsPerCycle,
    updatedAt: Date.now(),
  });

  if (!account.enterpriseUnlimited && account.monthlyCreditsPerCycle > 0) {
    await insertTransaction(ctx, {
      userId: account.userId,
      kind: transactionKind,
      creditsDelta: account.monthlyCreditsPerCycle,
      referenceType: "cycle_reset",
      referenceId: `${cycleStart}`,
      metadata: {
        note,
        planTier: account.planTier,
      },
    });
  }
}

async function ensureBillingAccountForUser(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Doc<"billingAccounts">> {
  const existing = await getBillingAccountByUser(ctx, userId);
  if (existing) {
    return existing;
  }

  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const now = Date.now();
  const cycle = resolveCurrentCycle(user._creationTime, now);
  const monthlyCreditsPerCycle = PLAN_CREDITS.starter;

  const accountId = await ctx.db.insert("billingAccounts", {
    userId,
    planTier: "starter",
    planStatus: "active",
    monthlyCreditsPerCycle,
    monthlyCreditsRemaining: monthlyCreditsPerCycle,
    currentCycleStartAt: cycle.start,
    currentCycleEndAt: cycle.end,
    enterpriseUnlimited: false,
    updatedAt: now,
  });

  await ctx.db.insert("creditBuckets", {
    userId,
    sourceType: "monthly",
    totalCredits: monthlyCreditsPerCycle,
    remainingCredits: monthlyCreditsPerCycle,
    expiresAt: cycle.end,
    metadata: {
      note: "Starter cycle allocation",
      planTier: "starter",
    },
  });

  await insertTransaction(ctx, {
    userId,
    kind: "reset",
    creditsDelta: monthlyCreditsPerCycle,
    referenceType: "account_init",
    referenceId: `${accountId}`,
    metadata: {
      note: "Initial starter cycle credits",
      planTier: "starter",
    },
  });

  const account = await ctx.db.get(accountId);
  if (!account) {
    throw new Error("Failed to create billing account");
  }
  return account;
}

async function getPipelineReservation(
  ctx: MutationCtx,
  interviewId: Id<"interviews">,
): Promise<Doc<"creditReservations"> | null> {
  const reservations = await ctx.db
    .query("creditReservations")
    .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
    .collect();

  return (
    reservations.find(
      (reservation) =>
        reservation.reservationType === "pipeline" &&
        reservation.status === "active",
    ) ?? null
  );
}

async function getRetryReservation(
  ctx: MutationCtx,
  interviewId: Id<"interviews">,
  attemptId: string,
): Promise<Doc<"creditReservations"> | null> {
  const reservations = await ctx.db
    .query("creditReservations")
    .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
    .collect();

  return (
    reservations.find(
      (reservation) =>
        reservation.reservationType === "analysis_retry" &&
        reservation.status === "active" &&
        reservation.metadata?.attemptId === attemptId,
    ) ?? null
  );
}

async function alreadyCharged(
  ctx: MutationCtx,
  userId: Id<"users">,
  referenceType: string,
  referenceId: string,
): Promise<boolean> {
  const existing = await ctx.db
    .query("billingTransactions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return existing.some(
    (transaction) =>
      transaction.kind === "charge" &&
      transaction.referenceType === referenceType &&
      transaction.referenceId === referenceId,
  );
}

export async function reservePipelineAndChargeStart(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const account = await ensureBillingAccountForUser(ctx, interviewerId);
  if (account.enterpriseUnlimited) {
    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "reserve",
      creditsDelta: 0,
      referenceType: "pipeline_reservation",
      referenceId: `${interviewId}`,
      metadata: {
        note: "Enterprise unlimited plan bypass",
        interviewId,
      },
    });
    return;
  }

  const existingReservation = await getPipelineReservation(ctx, interviewId);
  if (!existingReservation) {
    const state = await getCreditState(ctx, interviewerId);
    if (state.availableCredits < PIPELINE_TOTAL_COST) {
      throwInsufficientCredits(PIPELINE_TOTAL_COST, state.availableCredits);
    }

    await ctx.db.insert("creditReservations", {
      userId: interviewerId,
      interviewId,
      reservationType: "pipeline",
      reservedTotal: PIPELINE_TOTAL_COST,
      remainingReserved: PIPELINE_TOTAL_COST,
      status: "active",
      expiresAt: Date.now() + PIPELINE_RESERVATION_MS,
      metadata: {
        reason: "Interview pipeline reservation",
      },
    });

    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "reserve",
      creditsDelta: 0,
      referenceType: "pipeline_reservation",
      referenceId: `${interviewId}`,
      metadata: {
        interviewId,
      },
    });
  }

  await settleStartChargeForInterview(ctx, interviewerId, interviewId);
}

export async function settleStartChargeForInterview(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const account = await ensureBillingAccountForUser(ctx, interviewerId);
  if (account.enterpriseUnlimited) {
    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "charge",
      creditsDelta: 0,
      referenceType: "start_charge",
      referenceId: `${interviewId}`,
      metadata: {
        interviewId,
      },
    });
    return;
  }

  if (
    await alreadyCharged(ctx, interviewerId, "start_charge", `${interviewId}`)
  ) {
    return;
  }

  const reservation = await getPipelineReservation(ctx, interviewId);
  if (!reservation || reservation.remainingReserved < CREDIT_COSTS.start) {
    throw new Error("Missing pipeline reservation for start charge");
  }

  await debitSpendableBuckets(ctx, interviewerId, CREDIT_COSTS.start);

  const updatedRemaining = reservation.remainingReserved - CREDIT_COSTS.start;
  await ctx.db.patch(reservation._id, {
    remainingReserved: updatedRemaining,
    status: updatedRemaining === 0 ? "completed" : reservation.status,
  });

  await insertTransaction(ctx, {
    userId: interviewerId,
    kind: "charge",
    creditsDelta: -CREDIT_COSTS.start,
    referenceType: "start_charge",
    referenceId: `${interviewId}`,
    metadata: {
      interviewId,
      reservationId: reservation._id,
    },
  });

  await syncAccountMonthlyRemaining(ctx, account);
}

export async function settleFinalizeChargeForInterview(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const account = await ensureBillingAccountForUser(ctx, interviewerId);
  if (account.enterpriseUnlimited) {
    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "charge",
      creditsDelta: 0,
      referenceType: "finalize_charge",
      referenceId: `${interviewId}`,
      metadata: {
        interviewId,
      },
    });
    return;
  }

  if (
    await alreadyCharged(ctx, interviewerId, "finalize_charge", `${interviewId}`)
  ) {
    return;
  }

  const reservation = await getPipelineReservation(ctx, interviewId);
  if (!reservation || reservation.remainingReserved < CREDIT_COSTS.finalize) {
    throw new Error("Missing pipeline reservation for finalize charge");
  }

  await debitSpendableBuckets(ctx, interviewerId, CREDIT_COSTS.finalize);

  const updatedRemaining = reservation.remainingReserved - CREDIT_COSTS.finalize;
  await ctx.db.patch(reservation._id, {
    remainingReserved: updatedRemaining,
    status: updatedRemaining === 0 ? "completed" : reservation.status,
  });

  await insertTransaction(ctx, {
    userId: interviewerId,
    kind: "charge",
    creditsDelta: -CREDIT_COSTS.finalize,
    referenceType: "finalize_charge",
    referenceId: `${interviewId}`,
    metadata: {
      interviewId,
      reservationId: reservation._id,
    },
  });

  await syncAccountMonthlyRemaining(ctx, account);
}

export async function reserveAnalysisRetryForInterview(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
  attemptId: string,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const account = await ensureBillingAccountForUser(ctx, interviewerId);
  if (account.enterpriseUnlimited) {
    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "reserve",
      creditsDelta: 0,
      referenceType: "analysis_retry_reservation",
      referenceId: normalizeReservationReference(interviewId, attemptId),
      metadata: {
        interviewId,
        attemptId,
        note: "Enterprise unlimited plan bypass",
      },
    });
    return;
  }

  const state = await getCreditState(ctx, interviewerId);
  if (state.availableCredits < CREDIT_COSTS.analysis) {
    throwInsufficientCredits(CREDIT_COSTS.analysis, state.availableCredits);
  }

  await ctx.db.insert("creditReservations", {
    userId: interviewerId,
    interviewId,
    reservationType: "analysis_retry",
    reservedTotal: CREDIT_COSTS.analysis,
    remainingReserved: CREDIT_COSTS.analysis,
    status: "active",
    expiresAt: Date.now() + ANALYSIS_RETRY_RESERVATION_MS,
    metadata: {
      reason: "Analysis retry reservation",
      attemptId,
    },
  });

  await insertTransaction(ctx, {
    userId: interviewerId,
    kind: "reserve",
    creditsDelta: 0,
    referenceType: "analysis_retry_reservation",
    referenceId: normalizeReservationReference(interviewId, attemptId),
    metadata: {
      interviewId,
      attemptId,
    },
  });
}

export async function settleAnalysisChargeForInterview(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
  attemptId?: string,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const account = await ensureBillingAccountForUser(ctx, interviewerId);
  const referenceId = normalizeReservationReference(interviewId, attemptId);

  if (account.enterpriseUnlimited) {
    await insertTransaction(ctx, {
      userId: interviewerId,
      kind: "charge",
      creditsDelta: 0,
      referenceType: "analysis_charge",
      referenceId,
      metadata: {
        interviewId,
        attemptId,
      },
    });
    return;
  }

  if (await alreadyCharged(ctx, interviewerId, "analysis_charge", referenceId)) {
    return;
  }

  const reservation = attemptId
    ? await getRetryReservation(ctx, interviewId, attemptId)
    : await getPipelineReservation(ctx, interviewId);

  if (!reservation || reservation.remainingReserved < CREDIT_COSTS.analysis) {
    throw new Error("Missing reservation for analysis charge");
  }

  await debitSpendableBuckets(ctx, interviewerId, CREDIT_COSTS.analysis);

  const updatedRemaining = reservation.remainingReserved - CREDIT_COSTS.analysis;
  await ctx.db.patch(reservation._id, {
    remainingReserved: updatedRemaining,
    status: updatedRemaining === 0 ? "completed" : reservation.status,
  });

  await insertTransaction(ctx, {
    userId: interviewerId,
    kind: "charge",
    creditsDelta: -CREDIT_COSTS.analysis,
    referenceType: "analysis_charge",
    referenceId,
    metadata: {
      interviewId,
      reservationId: reservation._id,
      attemptId,
    },
  });

  await syncAccountMonthlyRemaining(ctx, account);
}

export async function releaseReservationForInterview(
  ctx: MutationCtx,
  interviewerId: Id<"users">,
  interviewId: Id<"interviews">,
  reason: string,
  attemptId?: string,
): Promise<void> {
  if (!isBillingEnforced()) {
    return;
  }

  const reservations = await ctx.db
    .query("creditReservations")
    .withIndex("by_interview", (q) => q.eq("interviewId", interviewId))
    .collect();

  const targets = reservations.filter((reservation) => {
    if (reservation.status !== "active") {
      return false;
    }
    if (attemptId) {
      return (
        reservation.reservationType === "analysis_retry" &&
        reservation.metadata?.attemptId === attemptId
      );
    }
    return reservation.reservationType === "pipeline";
  });

  for (const reservation of targets) {
    if (reservation.remainingReserved > 0) {
      await insertTransaction(ctx, {
        userId: interviewerId,
        kind: "release",
        creditsDelta: reservation.remainingReserved,
        referenceType: "reservation_release",
        referenceId: normalizeReservationReference(
          interviewId,
          reservation.metadata?.attemptId,
        ),
        metadata: {
          interviewId,
          reservationId: reservation._id,
          attemptId: reservation.metadata?.attemptId,
          note: reason,
        },
      });
    }

    await ctx.db.patch(reservation._id, {
      remainingReserved: 0,
      status: "released",
      metadata: {
        ...reservation.metadata,
        reason,
      },
    });
  }
}

async function lookupTopupPack(packId: string) {
  return TOPUP_PACKS.find((pack) => pack.id === packId) ?? null;
}

async function razorpayRequest<T>(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<T> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${toBase64(`${keyId}:${keySecret}`)}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Razorpay request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

async function ensureGrowthCycle(
  ctx: MutationCtx,
  account: Doc<"billingAccounts">,
  cycleStart: number,
  cycleEnd: number,
  eventId: string,
): Promise<void> {
  const cycleChanged =
    account.currentCycleStartAt !== cycleStart ||
    account.currentCycleEndAt !== cycleEnd ||
    account.planTier !== "growth";

  await ctx.db.patch(account._id, {
    planTier: "growth",
    planStatus: "active",
    monthlyCreditsPerCycle: PLAN_CREDITS.growth,
    enterpriseUnlimited: false,
    currentCycleStartAt: cycleStart,
    currentCycleEndAt: cycleEnd,
    monthlyCreditsRemaining: cycleChanged
      ? PLAN_CREDITS.growth
      : account.monthlyCreditsRemaining,
    graceEndsAt: undefined,
    updatedAt: Date.now(),
  });

  if (cycleChanged) {
    const patched = await ctx.db.get(account._id);
    if (!patched) {
      return;
    }
    await ensureMonthlyBucketForCycle(
      ctx,
      patched,
      cycleStart,
      cycleEnd,
      "subscription_renewal",
      "Growth subscription cycle renewal",
    );
  }
}

async function handleWebhookEvent(
  ctx: MutationCtx,
  args: {
    provider: string;
    eventId: string;
    eventType: string;
    payload: any;
  },
): Promise<"processed" | "ignored"> {
  if (args.provider !== "razorpay") {
    return "ignored";
  }
  if (!isRazorpayEnabled()) {
    return "ignored";
  }

  const payload = args.payload;

  if (args.eventType === "payment.captured") {
    const paymentEntity = payload?.payload?.payment?.entity;
    const notes = paymentEntity?.notes ?? {};

    if (notes?.purpose !== "topup") {
      return "ignored";
    }

    const userId = notes.userId as Id<"users"> | undefined;
    const packId = String(notes.packId ?? "");

    if (!userId) {
      return "ignored";
    }

    const pack = await lookupTopupPack(packId);
    if (!pack) {
      return "ignored";
    }

    await ensureBillingAccountForUser(ctx, userId);

    await ctx.db.insert("creditBuckets", {
      userId,
      sourceType: "topup",
      totalCredits: pack.credits,
      remainingCredits: pack.credits,
      expiresAt: Date.now() + TOPUP_EXPIRY_MS,
      metadata: {
        note: "Top-up purchase",
        packId: pack.id,
      },
    });

    await insertTransaction(ctx, {
      userId,
      kind: "topup",
      creditsDelta: pack.credits,
      rupeeAmount: pack.amountInr,
      referenceType: "razorpay_payment",
      referenceId: String(paymentEntity?.id ?? args.eventId),
      metadata: {
        eventId: args.eventId,
        packId: pack.id,
      },
    });

    return "processed";
  }

  if (
    args.eventType === "subscription.activated" ||
    args.eventType === "subscription.charged"
  ) {
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    const notes = subscriptionEntity?.notes ?? {};

    const subscriptionId = String(subscriptionEntity?.id ?? "");
    let userId = notes.userId as Id<"users"> | undefined;

    if (!userId && subscriptionId) {
      const accountBySubscription = await ctx.db
        .query("billingAccounts")
        .withIndex("by_razorpay_subscription", (q) =>
          q.eq("razorpaySubscriptionId", subscriptionId),
        )
        .first();
      userId = accountBySubscription?.userId;
    }

    if (!userId) {
      return "ignored";
    }

    const account = await ensureBillingAccountForUser(ctx, userId);

    const currentStartSeconds = Number(subscriptionEntity?.current_start ?? 0);
    const currentEndSeconds = Number(subscriptionEntity?.current_end ?? 0);

    const cycleStart =
      currentStartSeconds > 0 ? currentStartSeconds * 1000 : Date.now();
    const cycleEnd =
      currentEndSeconds > 0
        ? currentEndSeconds * 1000
        : addOneMonth(cycleStart);

    await ctx.db.patch(account._id, {
      razorpaySubscriptionId: subscriptionId || account.razorpaySubscriptionId,
      planTier: "growth",
      planStatus: "active",
      monthlyCreditsPerCycle: PLAN_CREDITS.growth,
      enterpriseUnlimited: false,
      updatedAt: Date.now(),
    });

    const refreshed = await ctx.db.get(account._id);
    if (!refreshed) {
      return "ignored";
    }

    await ensureGrowthCycle(ctx, refreshed, cycleStart, cycleEnd, args.eventId);
    return "processed";
  }

  if (
    args.eventType === "subscription.pending" ||
    args.eventType === "subscription.halted" ||
    args.eventType === "subscription.payment_failed"
  ) {
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    const subscriptionId = String(subscriptionEntity?.id ?? "");

    if (!subscriptionId) {
      return "ignored";
    }

    const account = await ctx.db
      .query("billingAccounts")
      .withIndex("by_razorpay_subscription", (q) =>
        q.eq("razorpaySubscriptionId", subscriptionId),
      )
      .first();

    if (!account) {
      return "ignored";
    }

    await ctx.db.patch(account._id, {
      planStatus: "grace",
      graceEndsAt: Date.now() + GRACE_PERIOD_MS,
      updatedAt: Date.now(),
    });

    return "processed";
  }

  if (args.eventType === "subscription.cancelled") {
    const subscriptionEntity = payload?.payload?.subscription?.entity;
    const subscriptionId = String(subscriptionEntity?.id ?? "");

    if (!subscriptionId) {
      return "ignored";
    }

    const account = await ctx.db
      .query("billingAccounts")
      .withIndex("by_razorpay_subscription", (q) =>
        q.eq("razorpaySubscriptionId", subscriptionId),
      )
      .first();

    if (!account) {
      return "ignored";
    }

    await ctx.db.patch(account._id, {
      planStatus: "canceled",
      updatedAt: Date.now(),
    });

    return "processed";
  }

  return "ignored";
}

export const ensureBillingAccount = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ensureBillingAccountForUser(ctx, args.userId);
  },
});

export const applyWebhookEvent = internalMutation({
  args: {
    provider: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    payloadHash: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("billingWebhookEvents")
      .withIndex("by_provider_event", (q) =>
        q.eq("provider", args.provider).eq("eventId", args.eventId),
      )
      .unique();

    if (existing) {
      return { status: "duplicate" as const };
    }

    const webhookEventId = await ctx.db.insert("billingWebhookEvents", {
      provider: args.provider,
      eventId: args.eventId,
      eventType: args.eventType,
      processedAt: Date.now(),
      status: "ignored",
      payloadHash: args.payloadHash,
    });

    try {
      const status = await handleWebhookEvent(ctx, {
        provider: args.provider,
        eventId: args.eventId,
        eventType: args.eventType,
        payload: args.payload,
      });

      await ctx.db.patch(webhookEventId, {
        status,
        processedAt: Date.now(),
      });

      return { status };
    } catch (error) {
      await ctx.db.patch(webhookEventId, {
        status: "failed",
        processedAt: Date.now(),
      });
      throw error;
    }
  },
});

async function runCycleResetAt(ctx: MutationCtx, now: number): Promise<void> {
  const accounts = await ctx.db.query("billingAccounts").collect();

  for (const account of accounts) {
    if (account.enterpriseUnlimited) {
      continue;
    }

    if (now < account.currentCycleEndAt) {
      continue;
    }

    let cycleStart = account.currentCycleStartAt;
    let cycleEnd = account.currentCycleEndAt;
    while (now >= cycleEnd) {
      cycleStart = cycleEnd;
      cycleEnd = addOneMonth(cycleStart);
    }

    const refreshed = await ctx.db.get(account._id);
    if (!refreshed) {
      continue;
    }

    await ensureMonthlyBucketForCycle(
      ctx,
      refreshed,
      cycleStart,
      cycleEnd,
      "reset",
      "Scheduled cycle reset",
    );
  }
}

async function expireTopupsAt(ctx: MutationCtx, now: number): Promise<void> {
  const buckets = await ctx.db
    .query("creditBuckets")
    .withIndex("by_expires_at", (q) => q.lte("expiresAt", now))
    .collect();

  for (const bucket of buckets) {
    if (
      bucket.sourceType !== "topup" ||
      bucket.remainingCredits <= 0 ||
      bucket.expiresAt === undefined ||
      bucket.expiresAt > now
    ) {
      continue;
    }

    const expiredCredits = bucket.remainingCredits;
    await ctx.db.patch(bucket._id, {
      remainingCredits: 0,
    });

    await insertTransaction(ctx, {
      userId: bucket.userId,
      kind: "manual_adjustment",
      creditsDelta: -expiredCredits,
      referenceType: "topup_expiry",
      referenceId: `${bucket._id}`,
      metadata: {
        note: "Top-up credits expired",
        packId: bucket.metadata?.packId,
      },
    });

    const account = await getBillingAccountByUser(ctx, bucket.userId);
    if (account) {
      await syncAccountMonthlyRemaining(ctx, account);
    }
  }
}

async function expireStaleReservationsAt(
  ctx: MutationCtx,
  now: number,
): Promise<void> {
  const reservations = await ctx.db
    .query("creditReservations")
    .withIndex("by_expires_at", (q) => q.lte("expiresAt", now))
    .collect();

  for (const reservation of reservations) {
    if (reservation.status !== "active" || reservation.expiresAt > now) {
      continue;
    }

    await releaseReservationForInterview(
      ctx,
      reservation.userId,
      reservation.interviewId,
      "Reservation expired",
      reservation.metadata?.attemptId,
    );
  }
}

async function enforceGraceDowngradeAt(
  ctx: MutationCtx,
  now: number,
): Promise<void> {
  const graceAccounts = (
    await ctx.db
      .query("billingAccounts")
      .withIndex("by_plan_status", (q) => q.eq("planStatus", "grace"))
      .collect()
  ).filter((account) => account.graceEndsAt !== undefined);

  for (const account of graceAccounts) {
    if (!account.graceEndsAt || account.graceEndsAt > now) {
      continue;
    }

    const starterCredits = PLAN_CREDITS.starter;
    const cycleStart = now;
    const cycleEnd = addOneMonth(cycleStart);

    await ctx.db.patch(account._id, {
      planTier: "starter",
      planStatus: "active",
      monthlyCreditsPerCycle: starterCredits,
      monthlyCreditsRemaining: starterCredits,
      enterpriseUnlimited: false,
      currentCycleStartAt: cycleStart,
      currentCycleEndAt: cycleEnd,
      graceEndsAt: undefined,
      updatedAt: Date.now(),
    });

    const refreshed = await ctx.db.get(account._id);
    if (!refreshed) {
      continue;
    }

    await ensureMonthlyBucketForCycle(
      ctx,
      refreshed,
      cycleStart,
      cycleEnd,
      "reset",
      "Downgraded to starter after grace period",
    );
  }
}

export const runCycleReset = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    await runCycleResetAt(ctx, args.now);
    return { ok: true };
  },
});

export const expireTopups = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    await expireTopupsAt(ctx, args.now);
    return { ok: true };
  },
});

export const expireStaleReservations = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    await expireStaleReservationsAt(ctx, args.now);
    return { ok: true };
  },
});

export const enforceGraceDowngrade = internalMutation({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    await enforceGraceDowngradeAt(ctx, args.now);
    return { ok: true };
  },
});

export const reserveInterviewPipeline = internalMutation({
  args: {
    interviewerId: v.id("users"),
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    await reservePipelineAndChargeStart(ctx, args.interviewerId, args.interviewId);
    return { ok: true };
  },
});

export const settleStartCharge = internalMutation({
  args: {
    interviewerId: v.id("users"),
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    await settleStartChargeForInterview(ctx, args.interviewerId, args.interviewId);
    return { ok: true };
  },
});

export const settleFinalizeCharge = internalMutation({
  args: {
    interviewerId: v.id("users"),
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    await settleFinalizeChargeForInterview(
      ctx,
      args.interviewerId,
      args.interviewId,
    );
    return { ok: true };
  },
});

export const settleAnalysisCharge = internalMutation({
  args: {
    interviewerId: v.id("users"),
    interviewId: v.id("interviews"),
    attemptId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await settleAnalysisChargeForInterview(
      ctx,
      args.interviewerId,
      args.interviewId,
      args.attemptId,
    );
    return { ok: true };
  },
});

export const releaseReservation = internalMutation({
  args: {
    interviewerId: v.id("users"),
    interviewId: v.id("interviews"),
    reason: v.string(),
    attemptId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await releaseReservationForInterview(
      ctx,
      args.interviewerId,
      args.interviewId,
      args.reason,
      args.attemptId,
    );
    return { ok: true };
  },
});

export const setRazorpayCustomer = internalMutation({
  args: {
    userId: v.id("users"),
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ensureBillingAccountForUser(ctx, args.userId);
    await ctx.db.patch(account._id, {
      razorpayCustomerId: args.customerId,
      updatedAt: Date.now(),
    });
  },
});

export const setRazorpaySubscription = internalMutation({
  args: {
    userId: v.id("users"),
    subscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const account = await ensureBillingAccountForUser(ctx, args.userId);
    await ctx.db.patch(account._id, {
      razorpaySubscriptionId: args.subscriptionId,
      updatedAt: Date.now(),
    });
  },
});

export const backfillStarterAccounts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let created = 0;
    for (const user of users) {
      const existing = await getBillingAccountByUser(ctx, user._id);
      if (existing) {
        continue;
      }
      await ensureBillingAccountForUser(ctx, user._id);
      created += 1;
    }

    return { created };
  },
});

export const runCycleResetJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    await runCycleResetAt(ctx, Date.now());
    return { ok: true };
  },
});

export const expireTopupsJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    await expireTopupsAt(ctx, Date.now());
    return { ok: true };
  },
});

export const expireStaleReservationsJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    await expireStaleReservationsAt(ctx, Date.now());
    return { ok: true };
  },
});

export const enforceGraceDowngradeJob = internalMutation({
  args: {},
  handler: async (ctx) => {
    await enforceGraceDowngradeAt(ctx, Date.now());
    return { ok: true };
  },
});

export const getBillingDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const account = await ctx.db
      .query("billingAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const now = Date.now();
    const starterCycle = resolveCurrentCycle(user._creationTime, now);

    const effectivePlanTier = ensurePlanTier(account?.planTier);
    const effectiveMonthlyCredits =
      account?.monthlyCreditsPerCycle ?? inferMonthlyCredits(effectivePlanTier);

    const buckets = await ctx.db
      .query("creditBuckets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const reservations = (
      await ctx.db
        .query("creditReservations")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect()
    ).filter((reservation) => reservation.status === "active");

    const hasAccount = account !== null;
    const spendableCredits = hasAccount
      ? buckets
          .filter((bucket) => bucket.sourceType !== "reservation")
          .reduce((total, bucket) => total + bucket.remainingCredits, 0)
      : PLAN_CREDITS.starter;

    const topupRemaining = hasAccount
      ? buckets
          .filter((bucket) => bucket.sourceType === "topup")
          .reduce((total, bucket) => total + bucket.remainingCredits, 0)
      : 0;

    const monthlyRemaining = hasAccount
      ? buckets
          .filter((bucket) => bucket.sourceType === "monthly")
          .reduce((total, bucket) => total + bucket.remainingCredits, 0)
      : PLAN_CREDITS.starter;

    const reservedCredits = hasAccount
      ? reservations.reduce(
          (total, reservation) => total + reservation.remainingReserved,
          0,
        )
      : 0;

    const enterpriseUnlimited = account?.enterpriseUnlimited ?? false;

    return {
      account: {
        planTier: account?.planTier ?? "starter",
        planStatus: account?.planStatus ?? "active",
        monthlyCreditsPerCycle: effectiveMonthlyCredits,
        monthlyCreditsRemaining:
          account?.monthlyCreditsRemaining ?? PLAN_CREDITS.starter,
        currentCycleStartAt: account?.currentCycleStartAt ?? starterCycle.start,
        currentCycleEndAt: account?.currentCycleEndAt ?? starterCycle.end,
        graceEndsAt: account?.graceEndsAt,
        enterpriseUnlimited,
        razorpayCustomerId: account?.razorpayCustomerId,
        razorpaySubscriptionId: account?.razorpaySubscriptionId,
      },
      balances: {
        spendableCredits,
        reservedCredits,
        availableCredits: enterpriseUnlimited
          ? null
          : Math.max(0, spendableCredits - reservedCredits),
        topupRemaining,
        monthlyRemaining,
      },
      costs: CREDIT_COSTS,
      growthPriceInr: GROWTH_PRICE_INR,
      topupPacks: isRazorpayEnabled() ? TOPUP_PACKS : [],
      featureFlags: {
        billingEnforced: isBillingEnforced(),
        razorpayEnabled: isRazorpayEnabled(),
      },
    };
  },
});

export const listBillingTransactions = query({
  args: {
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { items: [], nextCursor: null as number | null, hasMore: false };
    }

    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);

    const queryWithCursor = args.cursor
      ? ctx.db
          .query("billingTransactions")
          .withIndex("by_user_created", (q) =>
            q.eq("userId", userId).lt("createdAt", args.cursor as number),
          )
      : ctx.db
          .query("billingTransactions")
          .withIndex("by_user_created", (q) => q.eq("userId", userId));

    const page = await queryWithCursor.order("desc").take(limit + 1);

    const hasMore = page.length > limit;
    const items = hasMore ? page.slice(0, limit) : page;
    const nextCursor = hasMore
      ? items[items.length - 1]?.createdAt ?? null
      : null;

    return { items, nextCursor, hasMore };
  },
});

export const createTopupCheckout: any = action({
  args: {
    packId: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    checkoutUrl: string | null;
    paymentLinkId: string;
    amountInr: number;
    pack: (typeof TOPUP_PACKS)[number];
  }> => {
    if (!isRazorpayEnabled()) {
      throw new Error("Razorpay integration is disabled");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const pack = await lookupTopupPack(args.packId);
    if (!pack) {
      throw new Error("Invalid top-up pack");
    }

    await ctx.runMutation(internal.billing.ensureBillingAccount, { userId });

    const user = (await ctx.runQuery(api.auth.getUserById, {
      userId,
    })) as Doc<"users"> | null;

    const paymentLink: {
      id: string;
      short_url?: string;
      amount: number;
      currency: string;
    } = await razorpayRequest<{
      id: string;
      short_url?: string;
      amount: number;
      currency: string;
    }>("/payment_links", "POST", {
      amount: pack.amountInr * 100,
      currency: "INR",
      accept_partial: false,
      description: `${pack.credits} credits top-up`,
      customer: {
        name: user?.name ?? user?.email ?? "Oslin User",
        email: user?.email,
      },
      notify: {
        email: Boolean(user?.email),
        sms: false,
      },
      reminder_enable: true,
      notes: {
        purpose: "topup",
        userId,
        packId: pack.id,
      },
      reference_id: `topup_${userId}_${Date.now()}`,
    });

    return {
      checkoutUrl: paymentLink.short_url ?? null,
      paymentLinkId: paymentLink.id,
      amountInr: pack.amountInr,
      pack,
    };
  },
});

export const createGrowthSubscriptionCheckout: any = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    checkoutUrl: string | null;
    subscriptionId: string;
    amountInr: number;
  }> => {
    if (!isRazorpayEnabled()) {
      throw new Error("Razorpay integration is disabled");
    }

    const planId = process.env.RAZORPAY_GROWTH_PLAN_ID;
    if (!planId) {
      throw new Error("Missing RAZORPAY_GROWTH_PLAN_ID");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const account = (await ctx.runMutation(
      internal.billing.ensureBillingAccount,
      {
        userId,
      },
    )) as Doc<"billingAccounts">;

    const user = (await ctx.runQuery(api.auth.getUserById, {
      userId,
    })) as Doc<"users"> | null;

    let customerId: string | undefined = account.razorpayCustomerId;
    if (!customerId) {
      const customer = await razorpayRequest<{ id: string }>("/customers", "POST", {
        name: user?.name ?? user?.email ?? "Oslin User",
        email: user?.email,
        fail_existing: 0,
        notes: {
          userId,
          purpose: "growth_subscription",
        },
      });
      customerId = customer.id;
      await ctx.runMutation(internal.billing.setRazorpayCustomer, {
        userId,
        customerId,
      });
    }

    const subscription = await razorpayRequest<{
      id: string;
      short_url?: string;
    }>("/subscriptions", "POST", {
      plan_id: planId,
      customer_notify: 1,
      total_count: 120,
      customer_id: customerId,
      notes: {
        userId,
        purpose: "growth_subscription",
      },
    });

    await ctx.runMutation(internal.billing.setRazorpaySubscription, {
      userId,
      subscriptionId: subscription.id,
    });

    return {
      checkoutUrl: subscription.short_url ?? null,
      subscriptionId: subscription.id,
      amountInr: GROWTH_PRICE_INR,
    };
  },
});

export const openRazorpayCustomerPortal: any = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const url = process.env.RAZORPAY_CUSTOMER_PORTAL_URL;
    if (!url) {
      throw new Error(
        "Razorpay customer portal URL is not configured (RAZORPAY_CUSTOMER_PORTAL_URL)",
      );
    }

    return { url };
  },
});

export const cancelGrowthAtPeriodEnd: any = action({
  args: {},
  handler: async (ctx) => {
    if (!isRazorpayEnabled()) {
      throw new Error("Razorpay integration is disabled");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const account = (await ctx.runMutation(
      internal.billing.ensureBillingAccount,
      { userId },
    )) as Doc<"billingAccounts">;

    if (!account.razorpaySubscriptionId) {
      throw new Error("No active Razorpay subscription found");
    }

    await razorpayRequest(
      `/subscriptions/${account.razorpaySubscriptionId}/cancel`,
      "POST",
      {
        cancel_at_cycle_end: 1,
      },
    );

    return { success: true };
  },
});
