import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateJobProfile } from "./CreateJobProfile";
import { JobProfileList } from "./JobProfileList";
import { InterviewsList } from "./InterviewsList";
import { Id } from "../../convex/_generated/dataModel";

export function InterviewerDashboard() {
  const [activeTab, setActiveTab] = useState<"profiles" | "interviews">("profiles");
  const [selectedProfile, setSelectedProfile] = useState<Id<"jobProfiles"> | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("profiles")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "profiles"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Job Profiles
        </button>
        <button
          onClick={() => setActiveTab("interviews")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "interviews"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Interviews
        </button>
      </div>

      {activeTab === "profiles" ? (
        <div className="space-y-6">
          <CreateJobProfile />
          <JobProfileList onSelectProfile={setSelectedProfile} />
        </div>
      ) : (
        <InterviewsList />
      )}
    </div>
  );
}
