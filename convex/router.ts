import { httpRouter } from "convex/server";
import { handleRazorpayWebhook } from "./billingWebhook";

const http = httpRouter();

http.route({
  path: "/webhooks/razorpay",
  method: "POST",
  handler: handleRazorpayWebhook,
});

export default http;
