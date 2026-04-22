import { httpAction } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  authenticateApiKey,
  exportInterviewDetail,
  exportInterviews,
  exportJobProfiles,
  touchApiKey,
} from "./hrms";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token.trim();
}

async function authenticateRequest(ctx: any, request: Request) {
  const token = readBearerToken(request);
  if (!token) {
    return json({ error: "Missing bearer token" }, 401);
  }

  const auth = await ctx.runQuery(authenticateApiKey as any, { token });
  if (!auth) {
    return json({ error: "Invalid API key" }, 401);
  }

  await ctx.runMutation(touchApiKey as any, { keyId: auth.keyId });
  return auth;
}

export const handleHrmsJobProfiles = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authenticated = await authenticateRequest(ctx, request);
  if (authenticated instanceof Response) {
    return authenticated;
  }

  const items = await ctx.runQuery(exportJobProfiles as any, {
    userId: authenticated.userId,
  });

  return json({
    exportedAt: Date.now(),
    items,
  });
});

export const handleHrmsInterviews = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authenticated = await authenticateRequest(ctx, request);
  if (authenticated instanceof Response) {
    return authenticated;
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const updatedAfterValue = url.searchParams.get("updatedAfter");
  const limitValue = url.searchParams.get("limit");

  const allowedStatuses = new Set([
    "pending",
    "in_progress",
    "completed",
    "analyzed",
  ]);

  if (status && !allowedStatuses.has(status)) {
    return json({ error: "Invalid status filter" }, 400);
  }

  const updatedAfter = updatedAfterValue ? Number(updatedAfterValue) : undefined;
  if (updatedAfterValue && Number.isNaN(updatedAfter)) {
    return json({ error: "updatedAfter must be a Unix timestamp in milliseconds" }, 400);
  }

  const limit = limitValue ? Number(limitValue) : undefined;
  if (limitValue && Number.isNaN(limit)) {
    return json({ error: "limit must be a number" }, 400);
  }

  const items = await ctx.runQuery(exportInterviews as any, {
    userId: authenticated.userId,
    status: status as "pending" | "in_progress" | "completed" | "analyzed" | undefined,
    updatedAfter,
    limit,
  });

  return json({
    exportedAt: Date.now(),
    items,
  });
});

export const handleHrmsInterviewDetail = httpAction(async (ctx, request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authenticated = await authenticateRequest(ctx, request);
  if (authenticated instanceof Response) {
    return authenticated;
  }

  const url = new URL(request.url);
  const interviewId = url.searchParams.get("interviewId");
  if (!interviewId) {
    return json({ error: "interviewId is required" }, 400);
  }

  const item = await ctx.runQuery(exportInterviewDetail as any, {
    userId: authenticated.userId,
    interviewId: interviewId as Id<"interviews">,
  });

  if (!item) {
    return json({ error: "Interview not found" }, 404);
  }

  return json({
    exportedAt: Date.now(),
    item,
  });
});
