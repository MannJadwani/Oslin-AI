"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-2 h-11 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
      onClick={() => void signOut()}
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  );
}
