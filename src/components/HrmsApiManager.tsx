import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, DatabaseZap, KeyRound, Trash2 } from "lucide-react";

function formatDate(value: number | null) {
  if (!value) {
    return "Never";
  }
  return new Date(value).toLocaleString();
}

export function HrmsApiManager() {
  const apiKeys = useQuery(api.hrms.listApiKeys);
  const createApiKey = useMutation(api.hrms.createApiKey);
  const revokeApiKey = useMutation(api.hrms.revokeApiKey);

  const [label, setLabel] = useState("Primary HRMS");
  const [isCreating, setIsCreating] = useState(false);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const endpoints = useMemo(
    () => [
      `${origin}/api/hrms/job-profiles`,
      `${origin}/api/hrms/interviews`,
      `${origin}/api/hrms/interview-detail?interviewId=<convex-id>`,
    ],
    [origin],
  );

  const handleCreate = async () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      toast.error("API key label is required");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createApiKey({ label: trimmedLabel });
      setRevealedToken(result.token);
      setLabel("Primary HRMS");
      toast.success("HRMS API key created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create API key",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (keyId: Id<"hrmsApiKeys">) => {
    try {
      await revokeApiKey({ keyId });
      toast.success("API key revoked");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke API key",
      );
    }
  };

  const copyToClipboard = async (value: string, labelText: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${labelText} copied`);
    } catch {
      toast.error(`Failed to copy ${labelText.toLowerCase()}`);
    }
  };

  return (
    <>
      <Card className="bg-white border-slate-100 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <DatabaseZap className="w-5 h-5 text-indigo-600" />
            HRMS API
          </CardTitle>
          <CardDescription>
            Create scoped API keys so your HRMS can pull job profiles,
            interviews, transcripts, and AI scores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              New API Key Label
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. BambooHR sync"
                className="h-11 rounded-xl border-slate-200"
              />
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {isCreating ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Available Endpoints</p>
            <div className="space-y-2">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <code className="min-w-0 flex-1 truncate text-xs text-slate-700">
                    {endpoint}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => copyToClipboard(endpoint, "Endpoint")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Send the key as an `Authorization: Bearer &lt;token&gt;` header.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Issued Keys</p>
            {apiKeys === undefined ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Loading API keys...
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                No HRMS API keys yet.
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{key.label}</p>
                          <Badge
                            className={`rounded-full border-0 ${
                              key.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {key.isActive ? "Active" : "Revoked"}
                          </Badge>
                        </div>
                        <code className="text-xs text-slate-600">{key.keyPrefix}</code>
                        <div className="text-xs text-slate-500">
                          Created: {formatDate(key.createdAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Last used: {formatDate(key.lastUsedAt)}
                        </div>
                      </div>
                      {key.isActive && (
                        <Button
                          variant="outline"
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleRevoke(key._id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!revealedToken} onOpenChange={(open) => !open && setRevealedToken(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>Copy Your HRMS API Key</DialogTitle>
            <DialogDescription>
              This token is only shown once. Store it in your HRMS integration
              securely before closing this dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <code className="break-all text-sm text-indigo-900">
                {revealedToken}
              </code>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Example:
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
{`curl -H "Authorization: Bearer ${revealedToken ?? "<token>"}" \\
  "${origin}/api/hrms/interviews"`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setRevealedToken(null)}
            >
              Close
            </Button>
            <Button
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
              onClick={() =>
                revealedToken && copyToClipboard(revealedToken, "API key")
              }
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
