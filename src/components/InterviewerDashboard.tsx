import { useState } from "react";
import { CreateJobProfile } from "./CreateJobProfile";
import { JobProfileList } from "./JobProfileList";
import { InterviewsList } from "./InterviewsList";
import { IntroQuestionsManager } from "./IntroQuestionsManager";
import { Documentation } from "./documentation/Documentation";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "../lib/DashboardContext";

export function InterviewerDashboard() {
  const { currentView, setCurrentView } = useDashboard();
  const [selectedProfile, setSelectedProfile] = useState<Id<"jobProfiles"> | null>(null);

  const handleSelectProfile = (id: Id<"jobProfiles">) => {
      // Switch to interviews view
      setCurrentView("interviews");
  };

  // Map context views to internal tabs for the segmented control
  // We'll sync them so the segmented control also updates the global context
  const isProfilesTab = currentView === "dashboard";
  const isInterviewsTab = currentView === "interviews" || currentView === "candidates";

  if (currentView === "settings") {
      return (
          <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500">Configure your interview settings and global questions.</p>
              </div>
              <Separator className="bg-slate-200" />
              <IntroQuestionsManager />
          </div>
      )
  }

  if (currentView === "documentation") {
      return <Documentation />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {isProfilesTab ? "Dashboard" : "Candidates"}
            </h1>
            <p className="text-slate-500">
                {isProfilesTab 
                    ? "Manage job profiles and track candidate submissions."
                    : "Review video responses and candidate scores."}
            </p>
      </div>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Button
                variant={isProfilesTab ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className={`gap-2 rounded-xl px-4 transition-all ${isProfilesTab ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
            >
                <FileText className="w-4 h-4" />
          Job Profiles
            </Button>
            <Button
                variant={!isProfilesTab ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("interviews")}
                className={`gap-2 rounded-xl px-4 transition-all ${!isProfilesTab ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
            >
                <Users className="w-4 h-4" />
                Candidates
            </Button>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {isProfilesTab ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-600/20">
                           <PlusCircle className="w-5 h-5 text-white" />
                        </div>
                        New Job Profile
                    </CardTitle>
                    <CardDescription className="text-slate-500 mt-2">
                        Create a new position description to start interviewing candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
          <CreateJobProfile />
                </CardContent>
             </Card>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Active Profiles</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <JobProfileList onSelectProfile={handleSelectProfile} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <InterviewsList />
        </div>
      )}
    </div>
  );
}
