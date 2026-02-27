import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function hmacSha256Hex(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return bytesToHex(signature);
}

async function sha256Hex(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return bytesToHex(digest);
}

export const handleRazorpayWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Missing webhook secret", { status: 500 });
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  const rawBody = await request.text();
  const expectedSignature = await hmacSha256Hex(rawBody, webhookSecret);

  if (!timingSafeEqualHex(expectedSignature, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const eventType = String(payload?.event ?? "unknown");
  const eventIdHeader = request.headers.get("x-razorpay-event-id");
  const fallbackEntityId =
    payload?.payload?.payment?.entity?.id ??
    payload?.payload?.subscription?.entity?.id ??
    payload?.payload?.order?.entity?.id ??
    "unknown";
  const eventId = eventIdHeader ?? `${eventType}:${fallbackEntityId}`;
  const payloadHash = await sha256Hex(rawBody);

  await ctx.runMutation(internal.billing.applyWebhookEvent, {
    provider: "razorpay",
    eventId,
    eventType,
    payloadHash,
    payload,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});
