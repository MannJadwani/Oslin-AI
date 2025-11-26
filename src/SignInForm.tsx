"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-center">
            {flow === "signIn" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription className="text-center">
            {flow === "signIn"
              ? "Enter your credentials to access your account"
              : "Enter your email below to create your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData).catch((error) => {
                let toastTitle = "";
                if (error.message.includes("Invalid password")) {
                toastTitle = "Invalid password. Please try again.";
                } else {
                toastTitle =
                    flow === "signIn"
                    ? "Could not sign in, did you mean to sign up?"
                    : "Could not sign up, did you mean to sign in?";
                }
                toast.error(toastTitle);
                setSubmitting(false);
            });
            }}
        >
            <Input
            name="email"
            placeholder="Email address"
            type="email"
            required
            autoComplete="email"
            />
            <Input
            name="password"
            placeholder="Password"
            type="password"
            required
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
            />
            <Button type="submit" disabled={submitting} className="w-full">
            {flow === "signIn" ? "Sign in" : "Sign up"}
            </Button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => void signIn("anonymous")}>
            Sign in anonymously
        </Button>
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm text-muted-foreground">
          {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-primary"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
