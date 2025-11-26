import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface InterviewDetailProps {
  interviewId: Id<"interviews">;
}

export function InterviewDetail({ interviewId }: InterviewDetailProps) {
  const data = useQuery(api.interviews.get, { id: interviewId });

  if (data === undefined) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-8">Interview not found</div>;
  }

  const { interview, jobProfile, responses, analysis } = data;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{jobProfile?.title}</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Candidate:</span> {interview.candidateName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {interview.candidateEmail}
          </div>
          <div>
            <span className="font-medium">Started:</span>{" "}
            {interview.startedAt ? new Date(interview.startedAt).toLocaleString() : "N/A"}
          </div>
          <div>
            <span className="font-medium">Completed:</span>{" "}
            {interview.completedAt ? new Date(interview.completedAt).toLocaleString() : "N/A"}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">AI Analysis</h3>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl font-bold text-primary">{analysis.overallScore}/100</span>
              <span className="text-lg font-medium">Overall Score</span>
            </div>
            <p className="text-gray-600">{analysis.summary}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-700">Strengths</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-orange-700">Areas for Improvement</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Communication Style</h4>
              <p className="text-sm">{analysis.communicationStyle}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Confidence Level</h4>
              <p className="text-sm">{analysis.confidenceLevel}</p>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-semibold mb-2">Skill Alignment</h4>
              <p className="text-sm">{analysis.skillAlignment}</p>
            </div>

            {analysis.redFlags.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-2 text-red-700">Red Flags</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.redFlags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Interview Responses</h3>
        <div className="space-y-6">
          {jobProfile?.questions.map((question, idx) => {
            const response = responses.find(r => r.questionId === question.id);
            const questionAnalysis = analysis?.questionAnalyses.find(qa => qa.questionId === question.id);

            return (
              <div key={question.id} className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold mb-2">Q{idx + 1}: {question.text}</h4>
                
                {questionAnalysis && (
                  <div className="mb-3 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Score:</span>
                      <span className="text-primary font-bold">{questionAnalysis.score}/100</span>
                    </div>
                    <p className="text-sm text-gray-600">{questionAnalysis.feedback}</p>
                  </div>
                )}

                {response ? (
                  <div className="space-y-2">
                    {response.videoUrl && (
                      <video
                        src={response.videoUrl}
                        controls
                        className="w-full max-w-2xl rounded-lg"
                      />
                    )}
                    {response.transcript && (
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm font-medium mb-1">Transcript:</p>
                        <p className="text-sm text-gray-700">{response.transcript}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Duration: {Math.floor(response.duration)}s
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No response recorded</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {interview.status === "completed" && !analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">AI analysis in progress... This may take a few minutes.</p>
        </div>
      )}
    </div>
  );
}
