export const BILLING_INSUFFICIENT_PREFIX = "BILLING_INSUFFICIENT_CREDITS";

export function isBillingInsufficientCreditsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  return error.message.includes(BILLING_INSUFFICIENT_PREFIX);
}

export function extractBillingErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Not enough credits to complete this action.";
  }

  if (!isBillingInsufficientCreditsError(error)) {
    return error.message;
  }

  const details = error.message.split(":")[1]?.trim();
  if (details) {
    return `Insufficient credits (${details}).`;
  }
  return "Not enough credits to complete this action.";
}
