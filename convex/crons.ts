import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("billing-cycle-reset", { hours: 1 }, internal.billing.runCycleResetJob, {});
crons.interval("billing-expire-topups", { hours: 6 }, internal.billing.expireTopupsJob, {});
crons.interval(
  "billing-expire-stale-reservations",
  { hours: 1 },
  internal.billing.expireStaleReservationsJob,
  {},
);
crons.interval(
  "billing-enforce-grace-downgrade",
  { hours: 6 },
  internal.billing.enforceGraceDowngradeJob,
  {},
);

export default crons;
