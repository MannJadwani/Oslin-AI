"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, User, Lock, ArrowRight } from "lucide-react";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl">
           <Zap className="w-6 h-6 text-primary fill-current" />
        </div>
        <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {flow === "signIn" ? "Welcome back" : "Create an account"}
        </h2>
            <p className="text-sm text-slate-500">
            {flow === "signIn"
                ? "Enter your details to access your workspace"
                : "Get started with your 14-day free trial"}
        </p>
        </div>
      </div>

      <div>
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
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute left-3 top-3 text-slate-400">
                        <User className="w-5 h-5" />
                    </div>
            <Input
            name="email"
            placeholder="Email address"
          type="email"
          required
            autoComplete="email"
                        className="pl-10 h-12 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
        />
                </div>
                <div className="relative">
                     <div className="absolute left-3 top-3 text-slate-400">
                        <Lock className="w-5 h-5" />
                    </div>
            <Input
          name="password"
          placeholder="Password"
            type="password"
          required
            autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                         className="pl-10 h-12 rounded-full bg-slate-50 border-slate-200 focus:bg-white transition-all duration-200"
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={submitting} 
                className="w-full h-12 mt-2 rounded-full bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300 border border-blue-700 text-base font-semibold"
            >
                {flow === "signIn" ? "Sign in" : "Create account"} 
                <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-medium">
                <span className="bg-white px-3 text-slate-400">
                Or continue with
                </span>
            </div>
        </div>

        <Button 
            variant="outline" 
            className="w-full h-11 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium" 
            onClick={() => void signIn("anonymous")}
        >
             <div className="w-5 h-5 mr-2 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-3 h-3 text-slate-500" />
             </div>
            Sign in as Guest
        </Button>
      </div>

      <div className="flex justify-center mt-8 pt-6 border-t border-slate-50">
        <div className="text-sm text-slate-500">
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          <button
            type="button"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
