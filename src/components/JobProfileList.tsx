import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { toast } from "sonner";

interface JobProfileListProps {
  onSelectProfile: (id: Id<"jobProfiles">) => void;
}

export function JobProfileList({ onSelectProfile }: JobProfileListProps) {
  const profiles = useQuery(api.jobProfiles.list);
  const createInterview = useMutation(api.interviews.create);
  const [expandedProfile, setExpandedProfile] = useState<Id<"jobProfiles"> | null>(null);

  const handleCreateInterview = async (profileId: Id<"jobProfiles">) => {
    try {
      const result = await createInterview({ jobProfileId: profileId });
      const link = `${window.location.origin}?interview=${result.linkId}`;
      
      await navigator.clipboard.writeText(link);
      toast.success("Interview link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to create interview link");
    }
  };

  if (profiles === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No job profiles yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Job Profiles</h2>
      {profiles.map((profile) => (
        <div key={profile._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{profile.title}</h3>
              <p className="text-gray-600 mb-3">{profile.description}</p>
              
              <button
                onClick={() => setExpandedProfile(expandedProfile === profile._id ? null : profile._id)}
                className="text-sm text-primary hover:underline"
              >
                {expandedProfile === profile._id ? "Hide details" : "Show details"}
              </button>

              {expandedProfile === profile._id && (
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Qualifications:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {profile.qualifications.map((qual, idx) => (
                        <li key={idx}>{qual}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Questions ({profile.questions.length}):</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {profile.questions.map((q, idx) => (
                        <li key={q.id} className="border-l-2 border-primary pl-3">
                          <p className="font-medium">Q{idx + 1}: {q.text}</p>
                          <p className="text-xs text-gray-500">
                            {q.timeLimit ? `${q.timeLimit}s limit` : "No time limit"} • 
                            {q.allowRetake ? " Retakes allowed" : " No retakes"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleCreateInterview(profile._id)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Generate Interview Link
            </button>
            <button
              onClick={() => onSelectProfile(profile._id)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              View Interviews
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
