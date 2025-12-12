import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { LandingPage } from "./components/LandingPage";
import { CandidateInterview } from "./components/CandidateInterview";
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";
import { InterviewerDashboard } from "./components/InterviewerDashboard";
import { DashboardProvider } from "./lib/DashboardContext";

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
        <DashboardProvider>
        <Layout>
            <InterviewerDashboard />
        </Layout>
        </DashboardProvider>
      </Authenticated>

      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </>
  );
}
