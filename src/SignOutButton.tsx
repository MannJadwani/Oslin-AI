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
      variant="outline"
      className="w-full justify-start gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
      onClick={() => void signOut()}
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </Button>
  );
}
