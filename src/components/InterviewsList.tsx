import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { InterviewDetail } from "./InterviewDetail";
import { Id } from "../../convex/_generated/dataModel";

export function InterviewsList() {
  const interviews = useQuery(api.interviews.listAll);
  const [selectedInterview, setSelectedInterview] = useState<Id<"interviews"> | null>(null);

  if (interviews === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (selectedInterview) {
    return (
      <div>
        <button
          onClick={() => setSelectedInterview(null)}
          className="mb-4 text-primary hover:underline"
        >
          ← Back to all interviews
        </button>
        <InterviewDetail interviewId={selectedInterview} />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No interviews yet. Create a job profile and generate interview links!</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "analyzed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">All Interviews</h2>
      <div className="grid gap-4">
        {interviews.map((interview) => (
          <div key={interview._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{interview.jobTitle}</h3>
                {interview.candidateName && (
                  <p className="text-gray-600">
                    {interview.candidateName} ({interview.candidateEmail})
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(interview.status)}`}>
                {interview.status.replace("_", " ")}
              </span>
            </div>

            {interview.startedAt && (
              <p className="text-sm text-gray-500 mb-3">
                Started: {new Date(interview.startedAt).toLocaleString()}
              </p>
            )}

            <button
              onClick={() => setSelectedInterview(interview._id)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
              disabled={interview.status === "pending"}
            >
              {interview.status === "pending" ? "Waiting for candidate" : "View Details"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
