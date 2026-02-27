import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  BookOpenCheck,
  Coins,
  Shield,
  Users,
  Wrench,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "users", label: "Users", icon: Users },
  { id: "billing", label: "Billing Ops", icon: Coins },
  { id: "interviews", label: "Interview Ops", icon: Wrench },
  { id: "system", label: "System Health", icon: AlertTriangle },
  { id: "audit", label: "Audit", icon: BookOpenCheck },
] as const;

type AdminTab = (typeof tabs)[number]["id"];

export function AdminDashboard() {
  const adminContext = useQuery(api.admin.getMyAdminContext);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [jobReason, setJobReason] = useState("Routine admin operation");
  const [auditCursor, setAuditCursor] = useState<number | undefined>(undefined);
  const [auditCursorStack, setAuditCursorStack] = useState<Array<number | undefined>>([]);

  const bootstrapAdminRole = useMutation(api.admin.bootstrapAdminRole);
  const setUserRole = useMutation(api.admin.setUserRole);
  const setUserSuspended = useMutation(api.admin.setUserSuspended);
  const adjustCredits = useMutation(api.admin.adjustCredits);
  const runBillingJob = useMutation(api.admin.runBillingJob);
  const retryInterviewAnalysis = useMutation(api.admin.retryInterviewAnalysis);

  const isAdmin = adminContext?.isAdmin ?? false;

  const overview = useQuery(api.admin.getOverview, isAdmin ? {} : "skip");
  const users = useQuery(
    api.admin.listUsers,
    isAdmin
      ? {
          search: userSearch.trim() ? userSearch.trim() : undefined,
          limit: 100,
        }
      : "skip",
  );

  const userDetails = useQuery(
    api.admin.getUserDetails,
    isAdmin && selectedUserId
      ? { targetUserId: selectedUserId }
      : "skip",
  );

  const billingUserState = useQuery(
    api.admin.getBillingUserState,
    isAdmin && selectedUserId
      ? { targetUserId: selectedUserId }
      : "skip",
  );

  const interviews = useQuery(
    api.admin.listInterviewsGlobal,
    isAdmin ? { limit: 100 } : "skip",
  );

  const systemHealth = useQuery(api.admin.getSystemHealth, isAdmin ? {} : "skip");
  const webhookFailures = useQuery(
    api.admin.listWebhookFailures,
    isAdmin ? { limit: 20 } : "skip",
  );
  const auditLogs = useQuery(
    api.admin.listAuditLogs,
    isAdmin ? { cursor: auditCursor, limit: 20 } : "skip",
  );

  useEffect(() => {
    if (!users || users.length === 0) {
      return;
    }

    if (!selectedUserId || !users.some((user) => user.userId === selectedUserId)) {
      setSelectedUserId(users[0].userId);
    }
  }, [users, selectedUserId]);

  const selectedUser = useMemo(() => {
    if (!users || !selectedUserId) {
      return null;
    }
    return users.find((user) => user.userId === selectedUserId) ?? null;
  }, [users, selectedUserId]);

  if (adminContext === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!adminContext.isAuthenticated) {
    return (
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle>Admin Console</CardTitle>
          <CardDescription>Sign in to access admin tools.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Access Required
          </CardTitle>
          <CardDescription>
            This account does not currently have an admin role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            If this is the first admin setup for this environment, you can bootstrap
            super admin access once.
          </p>
          <Button
            className="rounded-xl"
            onClick={async () => {
              try {
                const result = await bootstrapAdminRole({});
                if (result.alreadyBootstrapped) {
                  toast.info("Admin roles are already initialized.");
                } else {
                  toast.success("Super admin role granted. Refreshing...");
                }
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to bootstrap admin role.",
                );
              }
            }}
          >
            Bootstrap Admin Role
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin Console
          </h1>
          <p className="text-slate-500">
            IT operations panel for user access, billing ops, and system health.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {adminContext.roleKeys.map((role) => (
            <Badge key={role} className="rounded-full bg-slate-900 text-white border-0">
              {role}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className={`rounded-xl ${
                activeTab === tab.id
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "text-slate-600"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Users" value={overview?.users} />
          <MetricCard title="Interviews" value={overview?.interviews} />
          <MetricCard title="Failed Webhooks" value={overview?.failedWebhookCount} />
          <MetricCard title="Suspended Users" value={overview?.suspendedCount} />
        </div>
      )}

      {activeTab === "users" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage roles and account suspension state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search users by name or email"
                className="rounded-xl"
              />

              <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-slate-500">
                      <th className="p-3">User</th>
                      <th className="p-3">Roles</th>
                      <th className="p-3">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users ?? []).map((user) => (
                      <tr
                        key={user.userId}
                        className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${
                          selectedUserId === user.userId ? "bg-indigo-50" : ""
                        }`}
                        onClick={() => setSelectedUserId(user.userId)}
                      >
                        <td className="p-3">
                          <p className="font-medium text-slate-900">{user.name ?? "Unknown"}</p>
                          <p className="text-xs text-slate-500">{user.email ?? "No email"}</p>
                        </td>
                        <td className="p-3 text-xs text-slate-700">
                          {user.roles.length > 0 ? user.roles.join(", ") : "—"}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`rounded-full border-0 ${
                              user.isSuspended
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {user.isSuspended ? "Suspended" : "Active"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>User Detail</CardTitle>
              <CardDescription>
                Selected: {selectedUser?.email ?? "No user selected"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedUserId || !userDetails ? (
                <p className="text-sm text-slate-500">Select a user to manage.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoTile label="Plan" value={userDetails.billingAccount?.planTier ?? "starter"} />
                    <InfoTile label="Credits" value={`${userDetails.credits.total}`} />
                    <InfoTile label="Top-up" value={`${userDetails.credits.topup}`} />
                    <InfoTile label="Monthly" value={`${userDetails.credits.monthly}`} />
                  </div>

                  <RoleToggleRow
                    roleKey="support_admin"
                    selectedUserId={selectedUserId}
                    currentRoles={userDetails.roles}
                    onToggle={async (enabled) => {
                      try {
                        await setUserRole({
                          targetUserId: selectedUserId,
                          roleKey: "support_admin",
                          enabled,
                          reason: "Admin panel role update",
                        });
                        toast.success("Support role updated.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed to update role.");
                      }
                    }}
                  />

                  <RoleToggleRow
                    roleKey="it_admin"
                    selectedUserId={selectedUserId}
                    currentRoles={userDetails.roles}
                    onToggle={async (enabled) => {
                      try {
                        await setUserRole({
                          targetUserId: selectedUserId,
                          roleKey: "it_admin",
                          enabled,
                          reason: "Admin panel role update",
                        });
                        toast.success("IT role updated.");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Failed to update role.");
                      }
                    }}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={async () => {
                        try {
                          await setUserSuspended({
                            targetUserId: selectedUserId,
                            isSuspended: !Boolean(userDetails.suspension?.isSuspended),
                            reason: "Admin panel suspension update",
                          });
                          toast.success("Suspension state updated.");
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Failed to update suspension.",
                          );
                        }
                      }}
                    >
                      {userDetails.suspension?.isSuspended ? "Reactivate" : "Suspend"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>Adjust Credits</CardTitle>
              <CardDescription>
                Positive adds credits, negative removes credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                value={adjustDelta}
                onChange={(event) => setAdjustDelta(Number(event.target.value))}
                placeholder="Credits delta"
                className="rounded-xl"
              />
              <Input
                value={adjustReason}
                onChange={(event) => setAdjustReason(event.target.value)}
                placeholder="Reason"
                className="rounded-xl"
              />
              <Button
                className="rounded-xl"
                disabled={!selectedUserId || !adjustReason.trim() || adjustDelta === 0}
                onClick={async () => {
                  if (!selectedUserId) {
                    return;
                  }
                  try {
                    await adjustCredits({
                      targetUserId: selectedUserId,
                      creditsDelta: adjustDelta,
                      reason: adjustReason.trim(),
                    });
                    toast.success("Credits adjusted.");
                    setAdjustDelta(0);
                    setAdjustReason("");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Failed to adjust credits.");
                  }
                }}
              >
                Apply Adjustment
              </Button>

              {billingUserState && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="font-medium text-slate-900 mb-2">Current Credit State</p>
                  <p className="text-slate-700">Total: {billingUserState.credits.total}</p>
                  <p className="text-slate-700">Monthly: {billingUserState.credits.monthly}</p>
                  <p className="text-slate-700">Top-up: {billingUserState.credits.topup}</p>
                  <p className="text-slate-700">Adjustment: {billingUserState.credits.adjustment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>Run Billing Jobs</CardTitle>
              <CardDescription>
                Trigger maintenance jobs with audit logging.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={jobReason}
                onChange={(event) => setJobReason(event.target.value)}
                placeholder="Reason"
                className="rounded-xl"
              />

              {[
                ["cycle_reset", "Run Cycle Reset"],
                ["expire_topups", "Expire Top-ups"],
                ["expire_stale_reservations", "Expire Stale Reservations"],
                ["enforce_grace_downgrade", "Enforce Grace Downgrade"],
              ].map(([job, label]) => (
                <Button
                  key={job}
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={async () => {
                    try {
                      await runBillingJob({
                        job: job as
                          | "cycle_reset"
                          | "expire_topups"
                          | "expire_stale_reservations"
                          | "enforce_grace_downgrade",
                        reason: jobReason || "Admin-triggered maintenance",
                      });
                      toast.success(`${label} triggered.`);
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : `Failed: ${label}`);
                    }
                  }}
                >
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "interviews" && (
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Interview Ops</CardTitle>
            <CardDescription>
              Retry analysis for completed/analyzed interviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-500">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(interviews ?? []).map((item) => (
                    <tr key={item.interviewId} className="border-t border-slate-100">
                      <td className="p-3">
                        <p className="font-medium text-slate-900">{item.candidateName ?? "Unknown"}</p>
                        <p className="text-xs text-slate-500">{item.candidateEmail ?? "No email"}</p>
                      </td>
                      <td className="p-3 text-slate-700">{item.jobTitle ?? "Unknown"}</td>
                      <td className="p-3">
                        <Badge className="rounded-full border-0 bg-slate-100 text-slate-700">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className="rounded-lg"
                          onClick={async () => {
                            try {
                              await retryInterviewAnalysis({
                                interviewId: item.interviewId,
                                reason: "Admin panel retry",
                              });
                              toast.success("Analysis retry queued.");
                            } catch (error) {
                              toast.error(
                                error instanceof Error ? error.message : "Retry failed.",
                              );
                            }
                          }}
                          disabled={
                            item.status !== "completed" && item.status !== "analyzed"
                          }
                        >
                          Retry Analysis
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "system" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Runtime and integration signals.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <InfoTile
                label="OpenAI"
                value={systemHealth?.openAiConfigured ? "Configured" : "Missing"}
              />
              <InfoTile
                label="Razorpay"
                value={systemHealth?.razorpayEnabled ? "Enabled" : "Disabled"}
              />
              <InfoTile
                label="Billing Enforcement"
                value={
                  systemHealth?.billingEnforcementEnabled ? "Enabled" : "Disabled"
                }
              />
              <InfoTile
                label="Failed Webhooks"
                value={`${systemHealth?.failedWebhooks ?? 0}`}
              />
              <InfoTile
                label="Accounts in Grace"
                value={`${systemHealth?.accountsInGrace ?? 0}`}
              />
              <InfoTile
                label="Suspended Users"
                value={`${systemHealth?.suspendedUsers ?? 0}`}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200">
            <CardHeader>
              <CardTitle>Webhook Failures</CardTitle>
              <CardDescription>Latest failed billing webhook events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(webhookFailures ?? []).length === 0 && (
                <p className="text-slate-500">No webhook failures reported.</p>
              )}
              {(webhookFailures ?? []).map((failure) => (
                <div
                  key={`${failure.provider}:${failure.eventId}`}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <p className="font-medium text-slate-900">{failure.eventType}</p>
                  <p className="text-xs text-slate-500">{failure.eventId}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(failure.processedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "audit" && (
        <Card className="rounded-2xl border-slate-200">
          <CardHeader>
            <CardTitle>Admin Audit Log</CardTitle>
            <CardDescription>All privileged admin actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {(auditLogs?.items ?? []).map((entry) => (
                <div key={entry._id} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{entry.action}</p>
                  <p className="text-slate-600">
                    target: {entry.targetType} / {entry.targetId}
                  </p>
                  <p className="text-xs text-slate-500">
                    actor: {entry.actorUserId} · {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
              {(!auditLogs || auditLogs.items.length === 0) && (
                <p className="text-sm text-slate-500">No audit entries yet.</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  if (auditCursorStack.length === 0) {
                    return;
                  }
                  const stack = [...auditCursorStack];
                  const previous = stack.pop();
                  setAuditCursor(previous);
                  setAuditCursorStack(stack);
                }}
                disabled={auditCursorStack.length === 0}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  if (!auditLogs?.nextCursor) {
                    return;
                  }
                  setAuditCursorStack((prev) => [...prev, auditCursor]);
                  setAuditCursor(auditLogs.nextCursor ?? undefined);
                }}
                disabled={!auditLogs?.hasMore || !auditLogs?.nextCursor}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number | undefined }) {
  return (
    <Card className="rounded-2xl border-slate-200">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value ?? "-"}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function RoleToggleRow({
  roleKey,
  currentRoles,
  selectedUserId,
  onToggle,
}: {
  roleKey: "it_admin" | "support_admin";
  currentRoles: string[];
  selectedUserId: Id<"users">;
  onToggle: (enabled: boolean) => Promise<void>;
}) {
  const enabled = currentRoles.includes(roleKey);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
      <div>
        <p className="font-medium text-slate-900">{roleKey}</p>
        <p className="text-xs text-slate-500">User: {selectedUserId}</p>
      </div>
      <Button
        variant={enabled ? "outline" : "default"}
        className="rounded-xl"
        onClick={() => {
          void onToggle(!enabled);
        }}
      >
        {enabled ? "Revoke" : "Grant"}
      </Button>
    </div>
  );
}
