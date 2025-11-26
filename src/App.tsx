import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { InterviewerDashboard } from "./components/InterviewerDashboard";
import { CandidateInterview } from "./components/CandidateInterview";
import { Layout } from "./components/Layout";
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
    <div className="min-h-screen bg-background font-sans text-foreground">
      {linkId ? (
        <div className="p-8 max-w-7xl mx-auto">
            <CandidateInterview linkId={linkId} />
        </div>
      ) : (
        <Content />
      )}
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <Layout>
            <InterviewerDashboard />
        </Layout>
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
          <div className="w-full max-w-md space-y-8 text-center mb-8">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary mb-2">InterviewAI</h1>
                <p className="text-muted-foreground text-lg">
                    AI-powered video interview platform for smarter hiring
                </p>
              </div>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </>
  );
}
