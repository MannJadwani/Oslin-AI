import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { InterviewerDashboard } from "./components/InterviewerDashboard";
import { CandidateInterview } from "./components/CandidateInterview";
import { useEffect, useState } from "react";

export default function App() {
  const [linkId, setLinkId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const link = params.get("interview");
    if (link) {
      setLinkId(link);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!linkId && (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <h2 className="text-xl font-semibold text-primary">InterviewAI</h2>
          <SignOutButton />
        </header>
      )}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-7xl mx-auto">
          {linkId ? (
            <CandidateInterview linkId={linkId} />
          ) : (
            <Content />
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Authenticated>
        <InterviewerDashboard />
      </Authenticated>

      <Unauthenticated>
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-5xl font-bold text-primary mb-4">InterviewAI</h1>
          <p className="text-xl text-secondary mb-8">
            AI-powered video interview platform for smarter hiring
          </p>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
