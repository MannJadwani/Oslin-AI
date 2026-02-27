import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { ArrowRight, Calendar, CreditCard, RefreshCw, Wallet, Zap } from "lucide-react";

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) {
    return "-";
  }
  return new Date(timestamp).toLocaleDateString();
}

function formatCredits(value: number | null): string {
  if (value === null) {
    return "Unlimited";
  }
  return `${value} credits`;
}

export function BillingDashboard() {
  const dashboard = useQuery(api.billing.getBillingDashboard);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<Array<number | undefined>>([]);
  const transactionsPage = useQuery(api.billing.listBillingTransactions, {
    cursor,
    limit: 15,
  });

  const createTopupCheckout = useAction(api.billing.createTopupCheckout);
  const createGrowthSubscriptionCheckout = useAction(
    api.billing.createGrowthSubscriptionCheckout,
  );
  const openRazorpayCustomerPortal = useAction(
    api.billing.openRazorpayCustomerPortal,
  );
  const cancelGrowthAtPeriodEnd = useAction(api.billing.cancelGrowthAtPeriodEnd);

  const [loadingTopupId, setLoadingTopupId] = useState<string | null>(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const planLabel = useMemo(() => {
    if (!dashboard?.account) {
      return "Starter";
    }

    switch (dashboard.account.planTier) {
      case "growth":
        return "Growth";
      case "enterprise":
        return "Enterprise";
      default:
        return "Starter";
    }
  }, [dashboard?.account]);

  if (dashboard === undefined || transactionsPage === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Sign in to view your billing details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const account = dashboard.account;
  const balances = dashboard.balances;
  const paymentsEnabled = dashboard.featureFlags.razorpayEnabled;

  const handleTopupCheckout = async (packId: string) => {
    try {
      setLoadingTopupId(packId);
      const result = await createTopupCheckout({ packId });
      if (!result.checkoutUrl) {
        toast.error("Checkout link was not returned. Please try again.");
        return;
      }
      window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      toast.success("Top-up checkout opened in a new tab.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open top-up checkout.";
      toast.error(message);
    } finally {
      setLoadingTopupId(null);
    }
  };

  const handleGrowthCheckout = async () => {
    try {
      setLoadingGrowth(true);
      const result = await createGrowthSubscriptionCheckout({});
      if (!result.checkoutUrl) {
        toast.error("Subscription checkout link was not returned. Please try again.");
        return;
      }
      window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      toast.success("Growth checkout opened in a new tab.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open Growth checkout.";
      toast.error(message);
    } finally {
      setLoadingGrowth(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setLoadingPortal(true);
      const result = await openRazorpayCustomerPortal({});
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open customer portal.";
      toast.error(message);
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleCancelGrowth = async () => {
    try {
      setLoadingCancel(true);
      await cancelGrowthAtPeriodEnd({});
      toast.success("Growth plan will be cancelled at period end.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel subscription.";
      toast.error(message);
    } finally {
      setLoadingCancel(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing</h1>
          <p className="text-slate-500">
            {paymentsEnabled
              ? "Manage plans, buy top-ups, and track usage transactions."
              : "Payments are disabled. Starter free plan is active."}
          </p>
        </div>
        <Badge
          className={`w-fit rounded-full px-3 py-1 border-0 ${
            paymentsEnabled ? "bg-indigo-600 text-white" : "bg-slate-700 text-white"
          }`}
        >
          {paymentsEnabled ? `${planLabel} Plan` : "Starter Plan (Free Only)"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription>Available Credits</CardDescription>
            <CardTitle className="text-3xl">
              {formatCredits(balances.availableCredits)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Spendable: {balances.spendableCredits} · Reserved: {balances.reservedCredits}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Pool</CardDescription>
            <CardTitle className="text-3xl">{balances.monthlyRemaining}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            {account.monthlyCreditsPerCycle} credits per cycle
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription>Top-up Pool</CardDescription>
            <CardTitle className="text-3xl">{balances.topupRemaining}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Top-up credits expire after 90 days
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5" />
              Current Cycle
            </CardTitle>
            <CardDescription>
              {formatDate(account.currentCycleStartAt)} - {formatDate(account.currentCycleEndAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-slate-500">Start Cost</p>
                <p className="text-xl font-semibold text-slate-900">{dashboard.costs.start}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-slate-500">Finalize Cost</p>
                <p className="text-xl font-semibold text-slate-900">{dashboard.costs.finalize}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-slate-500">Analysis Cost</p>
                <p className="text-xl font-semibold text-slate-900">{dashboard.costs.analysis}</p>
              </div>
            </div>

            {!paymentsEnabled ? (
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
                Payment features are temporarily disabled. Only the free Starter plan is available.
              </p>
            ) : account.planTier === "growth" || account.planTier === "enterprise" ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleOpenPortal}
                  disabled={loadingPortal}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loadingPortal ? "Opening..." : "Open Billing Portal"}
                </Button>

                {account.planTier === "growth" && (
                  <Button
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={handleCancelGrowth}
                    disabled={loadingCancel}
                  >
                    {loadingCancel ? "Submitting..." : "Cancel at Period End"}
                  </Button>
                )}
              </div>
            ) : (
              <Button
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                onClick={handleGrowthCheckout}
                disabled={loadingGrowth}
              >
                <Zap className="w-4 h-4 mr-2" />
                {loadingGrowth
                  ? "Opening Checkout..."
                  : `Upgrade to Growth (₹${dashboard.growthPriceInr}/month)`}
              </Button>
            )}

            {account.planStatus === "grace" && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Renewal payment failed. Grace period ends on {formatDate(account.graceEndsAt)}.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Wallet className="w-5 h-5" />
              {paymentsEnabled ? "Buy Top-up Credits" : "Top-up Credits"}
            </CardTitle>
            <CardDescription>
              {paymentsEnabled
                ? "Packs are consumed by earliest expiry and expire after 90 days."
                : "Top-ups are disabled while payments are turned off."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!paymentsEnabled && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Payment checkout is currently disabled.
              </div>
            )}
            {dashboard.topupPacks.map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-900">{pack.label}</p>
                  <p className="text-sm text-slate-500">₹{pack.amountInr}</p>
                </div>
                <Button
                  className="rounded-xl"
                  onClick={() => handleTopupCheckout(pack.id)}
                  disabled={loadingTopupId === pack.id}
                >
                  {loadingTopupId === pack.id ? "Opening..." : "Buy"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900">Transaction History</CardTitle>
            <CardDescription>
              Charges, resets, reservations, and purchases.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => {
              setCursor(undefined);
              setCursorStack([]);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Credits</th>
                  <th className="py-2 pr-4">Reference</th>
                </tr>
              </thead>
              <tbody>
                {transactionsPage.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No transactions yet.
                    </td>
                  </tr>
                )}
                {transactionsPage.items.map((tx) => (
                  <tr key={tx._id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 text-slate-700">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">{tx.kind}</td>
                    <td
                      className={`py-3 pr-4 font-semibold ${
                        tx.creditsDelta >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {tx.creditsDelta >= 0 ? `+${tx.creditsDelta}` : tx.creditsDelta}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{tx.referenceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                if (cursorStack.length === 0) {
                  return;
                }
                const stack = [...cursorStack];
                const previous = stack.pop();
                setCursor(previous);
                setCursorStack(stack);
              }}
              disabled={cursorStack.length === 0}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                if (!transactionsPage.nextCursor) {
                  return;
                }
                setCursorStack((prev) => [...prev, cursor]);
                setCursor(transactionsPage.nextCursor ?? undefined);
              }}
              disabled={!transactionsPage.hasMore || !transactionsPage.nextCursor}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
