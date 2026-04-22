import { httpRouter } from "convex/server";
import { handleRazorpayWebhook } from "./billingWebhook";
import {
  handleHrmsInterviewDetail,
  handleHrmsInterviews,
  handleHrmsJobProfiles,
} from "./hrmsHttp";

const http = httpRouter();

http.route({
  path: "/webhooks/razorpay",
  method: "POST",
  handler: handleRazorpayWebhook,
});

http.route({
  path: "/api/hrms/job-profiles",
  method: "GET",
  handler: handleHrmsJobProfiles,
});

http.route({
  path: "/api/hrms/interviews",
  method: "GET",
  handler: handleHrmsInterviews,
});

http.route({
  path: "/api/hrms/interview-detail",
  method: "GET",
  handler: handleHrmsInterviewDetail,
});

export default http;
