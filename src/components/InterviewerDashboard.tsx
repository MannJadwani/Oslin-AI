import { useState } from "react";
import { CreateJobProfile } from "./CreateJobProfile";
import { JobProfileList } from "./JobProfileList";
import { InterviewsList } from "./InterviewsList";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, List, FileText, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function InterviewerDashboard() {
  const [activeTab, setActiveTab] = useState<"profiles" | "interviews">("profiles");
  const [selectedProfile, setSelectedProfile] = useState<Id<"jobProfiles"> | null>(null);

  // If a profile is selected from the list, switch to interviews tab filtered by that profile
  // For simplicity in this iteration, we just switch tabs.
  // Ideally we would filter the list, but let's keep it simple first.
  const handleSelectProfile = (id: Id<"jobProfiles">) => {
      // In a real app we'd filter, here we just switch view to all candidates
      // You could pass the ID to InterviewsList to filter
      setActiveTab("interviews");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage job profiles and track candidate submissions.</p>
      </div>
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
                variant={activeTab === "profiles" ? "default" : "ghost"}
                size="sm"
          onClick={() => setActiveTab("profiles")}
                className="gap-2"
            >
                <FileText className="w-4 h-4" />
          Job Profiles
            </Button>
            <Button
                variant={activeTab === "interviews" ? "default" : "ghost"}
                size="sm"
          onClick={() => setActiveTab("interviews")}
                className="gap-2"
            >
                <Users className="w-4 h-4" />
                Candidates
            </Button>
        </div>
      </div>

      <Separator />

      {activeTab === "profiles" ? (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card className="bg-primary/5 border-primary/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        New Job Profile
                    </CardTitle>
                    <CardDescription>
                        Create a new position description to start interviewing candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
          <CreateJobProfile />
                </CardContent>
             </Card>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Active Profiles</h2>
            <JobProfileList onSelectProfile={handleSelectProfile} />
          </div>
        </div>
      ) : (
        <InterviewsList />
      )}
    </div>
  );
}
