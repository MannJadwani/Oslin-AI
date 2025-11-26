import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, XCircle, User, Mail, Calendar, PlayCircle, FileText, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface InterviewDetailProps {
  interviewId: Id<"interviews">;
}

export function InterviewDetail({ interviewId }: InterviewDetailProps) {
  const data = useQuery(api.interviews.get, { id: interviewId });
  const endInterview = useMutation(api.interviews.endInterview);
  const retryAnalysis = useMutation(api.ai.requestAnalysis);

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

  if (data === undefined) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
    );
  }

  if (!data) {
    return <div className="text-center py-8 text-muted-foreground">Interview not found</div>;
  }

  const { interview, jobProfile, responses, analysis } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl">{jobProfile?.title}</CardTitle>
                    <CardDescription>Interview Details</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={interview.status === "completed" ? "default" : "secondary"}>
                        {interview.status}
                    </Badge>
                    {interview.status === "in_progress" && (
                        <Button size="sm" variant="destructive" onClick={handleEndInterview}>
                            <Flag className="w-4 h-4 mr-2" /> End Interview
                        </Button>
                    )}
                    {(interview.status === "completed" || interview.status === "analyzed") && (
                        <Button size="sm" variant="outline" onClick={handleRetryAnalysis}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Retry Analysis
                        </Button>
                    )}
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Candidate</p>
                        <p className="font-semibold">{interview.candidateName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="font-semibold truncate max-w-[150px]" title={interview.candidateEmail}>{interview.candidateEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                        <p className="font-semibold">
                            {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : "Pending"}
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-primary">{analysis.overallScore}</span>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">/ 100 Score</span>
                </div>
                <Badge variant="outline" className="bg-background">AI Analysis</Badge>
             </div>
             <p className="pt-2 text-muted-foreground max-w-3xl">{analysis.summary}</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-green-700 mb-2">
                            <CheckCircle2 className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="space-y-2">
                            {analysis.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm bg-green-50 text-green-800 px-3 py-2 rounded-md border border-green-100">
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-orange-700 mb-2">
                            <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                        </h4>
                         <ul className="space-y-2">
                            {analysis.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="text-sm bg-orange-50 text-orange-800 px-3 py-2 rounded-md border border-orange-100">
                                    {weakness}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg">
                             <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Communication</h5>
                             <p className="font-medium text-sm">{analysis.communicationStyle}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg">
                             <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Confidence</h5>
                             <p className="font-medium text-sm">{analysis.confidenceLevel}</p>
                        </div>
                     </div>
                     
                     <div className="p-4 bg-muted/30 rounded-lg">
                         <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skill Alignment</h5>
                         <p className="font-medium text-sm">{analysis.skillAlignment}</p>
                     </div>

                    {analysis.redFlags.length > 0 && (
                        <div>
                            <h4 className="flex items-center gap-2 font-semibold text-destructive mb-2">
                                <XCircle className="w-4 h-4" /> Red Flags
                            </h4>
                            <ul className="space-y-1">
                                {analysis.redFlags.map((flag, idx) => (
                                    <li key={idx} className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/10">
                                        {flag}
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

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Responses</h3>
        <div className="grid gap-6">
          {jobProfile?.questions.map((question, idx) => {
            const response = responses.find(r => r.questionId === question.id);
            const questionAnalysis = analysis?.questionAnalyses.find(qa => qa.questionId === question.id);

            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className="bg-muted/10 pb-4">
                    <div className="flex justify-between items-start gap-4">
                        <h4 className="font-medium text-base">
                            <span className="text-muted-foreground mr-2">Q{idx + 1}.</span> 
                            {question.text}
                        </h4>
                        {questionAnalysis && (
                             <Badge variant={questionAnalysis.score >= 70 ? "default" : "secondary"}>
                                Score: {questionAnalysis.score}
                             </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {questionAnalysis && (
                         <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-sm text-muted-foreground italic">AI Feedback: "{questionAnalysis.feedback}"</p>
                         </div>
                    )}

                    {response ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <PlayCircle className="w-4 h-4" /> Video Response
                                </div>
                                {response.videoUrl && (
                                    <video
                                        src={response.videoUrl}
                                        controls
                                        className="w-full rounded-lg bg-black aspect-video"
                                    />
                                )}
                                <p className="text-xs text-muted-foreground text-right">
                                    Duration: {Math.floor(response.duration)}s
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                                    <FileText className="w-4 h-4" /> Transcript
                                </div>
                                <div className="p-4 bg-muted/20 rounded-lg text-sm leading-relaxed max-h-[250px] overflow-y-auto">
                                    {response.transcript || <span className="text-muted-foreground italic">No transcript available.</span>}
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border-dashed border">
                            No response recorded for this question.
                        </div>
                    )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {interview.status === "completed" && !analysis && (
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="flex items-center justify-center p-6 text-blue-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                AI analysis is in progress...
            </CardContent>
        </Card>
      )}
    </div>
  );
}
