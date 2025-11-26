import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CandidateInterviewProps {
  linkId: string;
}

export function CandidateInterview({ linkId }: CandidateInterviewProps) {
  const data = useQuery(api.interviews.getByLink, { linkId });
  const startInterview = useMutation(api.interviews.startInterview);
  const generateUploadUrl = useMutation(api.responses.generateUploadUrl);
  const saveResponse = useMutation(api.responses.saveResponse);
  const finalizeInterview = useMutation(api.responses.finalizeInterview);

  const [step, setStep] = useState<"intro" | "recording" | "intermission" | "uploading" | "complete">("intro");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewId, setInterviewId] = useState<Id<"interviews"> | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [intermissionTime, setIntermissionTime] = useState(0);
  const isStoppingRef = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intermissionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (intermissionTimerRef.current) {
        clearInterval(intermissionTimerRef.current);
      }
    };
  }, []);

  // Pre-fill if it's an existing invite
  useEffect(() => {
    if (data?.interview) {
        if (data.interview.candidateName) setCandidateName(data.interview.candidateName);
        if (data.interview.candidateEmail) setCandidateEmail(data.interview.candidateEmail);
    }
  }, [data]);

  // Auto-start recording when entering 'recording' state
  useEffect(() => {
    if (step === "recording" && hasPermissions && !isRecording) {
        startRecording();
    }
  }, [step, hasPermissions]);

  // Ensure video stream is attached when the video element becomes available (e.g. switching from intro to recording)
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [step, hasPermissions]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      toast.success("Camera and microphone access granted");
    } catch (error) {
      toast.error("Please allow camera and microphone access to continue");
    }
  };

  const handleStart = async () => {
    if (!candidateName || !candidateEmail) {
      toast.error("Please enter your name and email");
      return;
    }

    try {
      const id = await startInterview({
        linkId,
        candidateName,
        candidateEmail,
      });
      setInterviewId(id);
      // We need permissions before moving to recording
      await requestPermissions();
      setStep("recording");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Interview already started")) {
          toast.error("This interview has already been started or completed.");
      } else {
          toast.error("Failed to start interview");
      }
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      // Retry getting stream if lost (e.g. weird state transition)
      if (step === "recording") {
          requestPermissions().then(() => {
              if (streamRef.current) startRecording();
          });
      }
      return;
    }

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp8,opus",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const handleTimeUp = () => {
      // Prevent multiple calls
      if (isStoppingRef.current) return;
      isStoppingRef.current = true;
      
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecordingAndAdvance();
  }

  const stopRecordingAndAdvance = async () => {
    if (!mediaRecorderRef.current || !interviewId) return;

    // 1. Stop recording
    const mediaRecorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    setIsRecording(false);
    
    // Capture current state before async operations
    const questionIndex = currentQuestionIndex;
    const isLastQuestion = data?.jobProfile && questionIndex >= data.jobProfile.questions.length - 1;
    const currentQuestion = data?.jobProfile?.questions[questionIndex];
    const duration = recordingTime;
    
    // 2. Immediately transition UI - don't wait for upload
    if (isLastQuestion) {
        setStep("uploading");
    } else {
        startIntermission();
    }
    
    // 3. Stop media recorder and handle upload in background
    return new Promise<void>((resolve) => {
        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            
            if (currentQuestion && interviewId) {
                try {
                    const uploadUrl = await generateUploadUrl();
                    const uploadResult = await fetch(uploadUrl, {
                        method: "POST",
                        headers: { "Content-Type": blob.type },
                        body: blob,
                    });
                    const { storageId } = await uploadResult.json();
                    await saveResponse({
                        interviewId,
                        questionId: currentQuestion.id,
                        videoStorageId: storageId,
                        duration,
                        attemptNumber: 1,
                    });
                } catch (error) {
                    console.error("Failed to save response", error);
                }
            }
            
            // If this was the last question, now finalize
            if (isLastQuestion) {
                await handleComplete();
            }
            
            // Reset stopping flag for next question
            isStoppingRef.current = false;
            resolve();
        };
        mediaRecorder.stop();
    });
  };

  const startIntermission = () => {
      setStep("intermission");
      setIntermissionTime(5);
      
      if (intermissionTimerRef.current) clearInterval(intermissionTimerRef.current);
      
      intermissionTimerRef.current = setInterval(() => {
          setIntermissionTime((prev) => {
              if (prev <= 1) {
                  if (intermissionTimerRef.current) clearInterval(intermissionTimerRef.current);
                  setCurrentQuestionIndex(idx => idx + 1);
                  setStep("recording");
                  return 0;
              }
              return prev - 1;
          });
      }, 1000);
  };

  const handleComplete = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (interviewId) {
      try {
        await finalizeInterview({ interviewId });
        toast.success("Interview completed! Responses submitted.");
      } catch (error) {
        console.error("Failed to finalize interview", error);
      }
    }
    setStep("complete");
  };

  // Monitor time limit
  useEffect(() => {
    if (!isRecording || !data?.jobProfile) return;

    const currentQuestion = data.jobProfile.questions[currentQuestionIndex];
    const limit = currentQuestion?.timeLimit || 120;

    if (recordingTime >= limit) {
      handleTimeUp();
    }
  }, [recordingTime, isRecording, currentQuestionIndex, data]); // eslint-disable-next-line react-hooks/exhaustive-deps

  if (data === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="max-w-md mx-auto mt-20 text-center border-destructive/50">
        <CardHeader>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Interview Not Found</CardTitle>
            <CardDescription>This interview link is invalid or has expired.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl border-white/10 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-2">
              <Video className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">
              <span className="text-primary">Oslin</span>
              <span className="text-muted-foreground/80"> AI</span>
              <span className="block text-xl font-medium text-foreground mt-1">Video Interview</span>
            </CardTitle>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{data.jobProfile?.title}</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">{data.jobProfile?.description}</p>
            </div>
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-200 mt-4 text-left">
                <p className="font-semibold mb-1">⚠️ Anti-Cheating Mode Enabled</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Once started, questions will flow automatically.</li>
                    <li>You cannot stop or pause the recording manually.</li>
                    <li>You must answer until the timer runs out.</li>
                    <li>There are no retakes allowed.</li>
                </ul>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" className="w-full" onClick={handleStart}>
              I'm Ready to Start
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-white/10 bg-white/95 backdrop-blur text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Uploading Your Response...</CardTitle>
            <CardDescription className="text-base">
              Please wait while we save your interview.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-2xl border-white/10 bg-white/95 backdrop-blur text-center">
          <CardHeader>
            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700">All Done!</CardTitle>
            <CardDescription className="text-lg">
              Your interview has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The hiring team will review your responses and contact you at <span className="font-medium text-foreground">{candidateEmail}</span> regarding next steps.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Interview UI (Recording or Intermission)
  const currentQuestion = data.jobProfile?.questions[currentQuestionIndex];
  const timeLimit = currentQuestion?.timeLimit || 120; // Fallback default

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-50 flex flex-col">
        {/* Camera Feed Background */}
        <div className="absolute inset-0 z-0">
             <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]" 
            />
            {/* Dark overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Top Bar */}
        <div className="relative z-10 p-6 flex justify-between items-center text-white">
            <Badge variant="outline" className="bg-black/20 backdrop-blur-md border-white/20 text-white">
                Question {currentQuestionIndex + 1} of {data.jobProfile?.questions.length}
            </Badge>
            
            {step === "recording" && (
                <div className="flex items-center gap-2 bg-red-500/90 text-white px-3 py-1 rounded-full animate-pulse shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="font-mono font-medium text-sm">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                    </span>
                    <span className="opacity-75 text-xs border-l border-white/30 pl-2 ml-1">
                        / {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, "0")}
                    </span>
                </div>
            )}
        </div>

        {/* Center Content: Question Overlay */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-end p-4 pb-12">
            {step === "intermission" ? (
                 <div className="max-w-xl w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in duration-300">
                    <h2 className="text-3xl font-bold text-white mb-4">Time's Up!</h2>
                    <p className="text-white/80 mb-6">Next question starting in...</p>
                    <div className="text-6xl font-mono font-bold text-primary animate-pulse">
                        {intermissionTime}
                    </div>
                 </div>
            ) : (
                <div className="max-w-6xl w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        {timeLimit}s Answer Time
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-6 drop-shadow-sm">
                        {currentQuestion?.text}
                    </h2>

                    {!hasPermissions ? (
                        <Button size="lg" className="w-full max-w-sm mx-auto" onClick={requestPermissions}>
                            <Mic className="w-4 h-4 mr-2" />
                            Enable Camera & Microphone
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-red-400 font-medium animate-pulse">
                                <div className="w-3 h-3 bg-red-500 rounded-full" />
                                Recording...
                            </div>
                            <p className="text-white/50 text-xs">
                                Recording will stop automatically when time runs out.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Bottom Bar: Progress */}
        <div className="relative z-10 px-8 pb-8 pt-0">
            <div className="max-w-6xl mx-auto space-y-2">
                 <div className="flex justify-between text-xs font-medium text-white/50 uppercase tracking-wider">
                    <span>Progress</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / (data.jobProfile?.questions.length || 1)) * 100)}%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                        className="bg-white h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{ width: `${((currentQuestionIndex + 1) / (data.jobProfile?.questions.length || 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    </div>
  );
}

