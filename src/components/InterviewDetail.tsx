import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle, AlertCircle, XCircle, User, Mail, Calendar, PlayCircle, FileText, Flag, RefreshCw, Briefcase, Clock, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChunkedVideoPlayer } from "./ChunkedVideoPlayer";
import { useState } from "react";

interface InterviewDetailProps {
  interviewId: Id<"interviews">;
  onDelete?: () => void;
}

export function InterviewDetail({ interviewId, onDelete }: InterviewDetailProps) {
  const data = useQuery(api.interviews.get, { id: interviewId });
  const endInterview = useMutation(api.interviews.endInterview);
  const retryAnalysis = useMutation(api.ai.requestAnalysis);
  const deleteInterview = useMutation(api.interviews.deleteInterview);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleEndInterview = async () => {
    try {
      await endInterview({ interviewId });
      toast.success("Interview ended successfully.");
    } catch (error) {
      toast.error("Failed to end interview.");
    }
  };

  const handleRetryAnalysis = async () => {
    try {
      toast.info("Starting analysis retry...");
      await retryAnalysis({ interviewId });
      toast.success("Analysis requested. Check back in a moment.");
    } catch (error) {
      toast.error("Failed to request analysis retry.");
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteInterview({ interviewId });
      toast.success("Interview deleted successfully");
      setDeleteDialogOpen(false);
      // Call onDelete callback if provided (to close detail view)
      if (onDelete) {
        onDelete();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to delete interview");
      console.error(error);
    }
  };

  if (data === undefined) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[180px] w-full rounded-3xl" />
            <Skeleton className="h-[350px] w-full rounded-3xl" />
        </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-3xl border-dashed border border-slate-200">
        <div className="rounded-full bg-white p-4 mb-4 shadow-sm">
          <User className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Interview not found</h3>
        <p className="text-slate-500 text-sm">This interview may have been deleted or doesn't exist.</p>
      </div>
    );
  }

  const { interview, jobProfile, responses, analysis } = data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { class: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending" };
      case "in_progress": return { class: "bg-sky-50 text-sky-700 border-sky-200", label: "In Progress" };
      case "completed": return { class: "bg-violet-50 text-violet-700 border-violet-200", label: "Completed" };
      case "analyzed": return { class: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Analyzed" };
      default: return { class: "bg-slate-100 text-slate-700 border-slate-200", label: status };
    }
  };

  const statusConfig = getStatusConfig(interview.status);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Card */}
      <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
        <CardHeader className="p-6 md:p-8 bg-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            {/* Candidate Info */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-600/20 flex-shrink-0">
                {interview.candidateName ? interview.candidateName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
          <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{interview.candidateName || "Anonymous"}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {interview.candidateEmail}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {jobProfile?.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.class}`}>
                {statusConfig.label}
              </div>
                    {interview.status === "in_progress" && (
                <Button size="sm" variant="destructive" onClick={handleEndInterview} className="rounded-full h-10 px-5">
                            <Flag className="w-4 h-4 mr-2" /> End Interview
                        </Button>
                    )}
                    {(interview.status === "completed" || interview.status === "analyzed") && (
                <Button size="sm" variant="outline" onClick={handleRetryAnalysis} className="rounded-full h-10 px-5 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                            <RefreshCw className="w-4 h-4 mr-2" /> Retry Analysis
                        </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={handleDeleteClick} className="rounded-full h-10 px-5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                </div>
            </div>
        </CardHeader>

        {/* Meta Info */}
        <CardContent className="p-6 md:px-8 bg-slate-50/50 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <Calendar className="w-5 h-5 text-slate-500" />
          </div>
          <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Submitted</p>
                <p className="font-semibold text-slate-900">
                  {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : "Pending"}
                </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <Clock className="w-5 h-5 text-slate-500" />
          </div>
          <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Questions</p>
                <p className="font-semibold text-slate-900">{jobProfile?.questions.length || 0} Total</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                <PlayCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Responses</p>
                <p className="font-semibold text-slate-900">{responses.length} Recorded</p>
              </div>
            </div>
            {analysis && (
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border shadow-sm ${analysis.overallScore >= 70 ? "bg-emerald-500 border-emerald-500" : "bg-amber-500 border-amber-500"}`}>
                  <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">AI Score</p>
                  <p className={`font-bold text-lg ${analysis.overallScore >= 70 ? "text-emerald-600" : "text-amber-600"}`}>{analysis.overallScore}/100</p>
          </div>
        </div>
            )}
      </div>
        </CardContent>
      </Card>

      {/* AI Analysis Card */}
      {analysis && (
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-6 md:p-8 bg-indigo-600 border-b border-indigo-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-200" />
                  <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wide">AI Analysis</span>
                </div>
                <p className="text-indigo-100 max-w-2xl">{analysis.summary}</p>
              </div>
              <div className="flex items-baseline gap-1 bg-white px-5 py-3 rounded-xl shadow-sm">
                <span className="text-4xl font-bold text-slate-900">{analysis.overallScore}</span>
                <span className="text-slate-400 font-medium">/100</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 bg-white">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Strengths & Weaknesses */}
              <div className="space-y-6">
            <div>
                  <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-3">
                    <CheckCircle2 className="w-5 h-5" /> Strengths
                        </h4>
                        <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl border border-emerald-100">
                                    {strength}
                                </li>
                ))}
              </ul>
            </div>
            <div>
                  <h4 className="flex items-center gap-2 font-bold text-amber-700 mb-3">
                    <AlertTriangle className="w-5 h-5" /> Areas for Improvement
                        </h4>
                         <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm bg-amber-50 text-amber-800 px-4 py-3 rounded-xl border border-amber-100">
                                    {weakness}
                                </li>
                ))}
              </ul>
            </div>
            </div>

              {/* Insights */}
              <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Communication</h5>
                    <p className="font-semibold text-slate-900">{analysis.communicationStyle}</p>
                        </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Confidence</h5>
                    <p className="font-semibold text-slate-900">{analysis.confidenceLevel}</p>
                        </div>
            </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h5 className="text-xs font-semibold uppercase text-slate-400 mb-1">Skill Alignment</h5>
                  <p className="font-semibold text-slate-900">{analysis.skillAlignment}</p>
            </div>

            {analysis.redFlags.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <h4 className="flex items-center gap-2 font-bold text-red-700 mb-3">
                      <XCircle className="w-5 h-5" /> Red Flags
                            </h4>
                    <ul className="space-y-2">
                  {analysis.redFlags.map((flag, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          • {flag}
                                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
          </CardContent>
        </Card>
      )}

      {/* Responses Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">Interview Responses</h3>
        <div className="grid gap-6">
          {jobProfile?.questions.map((question, idx) => {
            const response = responses.find(r => r.questionId === question.id);
            const questionAnalysis = analysis?.questionAnalyses.find(qa => qa.questionId === question.id);

            return (
              <Card key={question.id} className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="p-5 md:p-6 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-white bg-indigo-600 w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5">
                        Q{idx + 1}
                      </span>
                      <h4 className="font-semibold text-slate-900">{question.text}</h4>
                    </div>
                {questionAnalysis && (
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${questionAnalysis.score >= 70 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                        Score: {questionAnalysis.score}/100
                      </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6 bg-white">
                    {questionAnalysis && (
                    <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-indigo-700">AI Feedback:</span> {questionAnalysis.feedback}
                      </p>
                  </div>
                )}

                {response ? (
                        <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                    <PlayCircle className="w-4 h-4" /> Video Response
                                </div>
                    <ChunkedVideoPlayer
                      videoUrl={response.videoUrl}
                      videoChunkUrls={response.videoChunkUrls}
                      isChunked={response.isChunked}
                    />
                        <p className="text-xs text-slate-400 text-right">
                      Duration: {Math.floor(response.duration)}s
                    </p>
                            </div>
                            
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                                    <FileText className="w-4 h-4" /> Transcript
                                </div>
                        <div className="p-4 bg-slate-50 rounded-xl text-sm leading-relaxed max-h-[250px] overflow-y-auto border border-slate-100 text-slate-700">
                          {response.transcript || <span className="text-slate-400 italic">No transcript available.</span>}
                                </div>
                            </div>
                  </div>
                ) : (
                    <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl border-dashed border border-slate-200">
                      <PlayCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            No response recorded for this question.
                        </div>
                )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Analysis In Progress */}
      {interview.status === "completed" && !analysis && (
        <Card className="rounded-2xl bg-indigo-50 border-indigo-100 shadow-sm">
          <CardContent className="flex items-center justify-center p-8 text-indigo-700 gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
            <span className="font-medium">AI analysis is in progress...</span>
            </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl p-0 gap-0 bg-white">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 space-y-2">
                <DialogTitle className="text-xl font-semibold text-slate-900 leading-tight">
                  Delete Interview
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 leading-relaxed">
                  Are you sure you want to delete this interview? This action cannot be undone. All responses, videos, and analysis data will be permanently deleted.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-initial sm:min-w-[100px] border-slate-200 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="flex-1 sm:flex-initial sm:min-w-[100px] bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
