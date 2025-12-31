import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Zap, Mic, CheckCircle, Clock, AlertCircle, SkipForward, Loader2, User, Mail, Briefcase, Shield, ArrowRight, HelpCircle, X, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  
  // Load interviewId from localStorage on mount
  const getStoredInterviewId = (): Id<"interviews"> | null => {
    try {
      const stored = localStorage.getItem(`interview_${linkId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if it's for the same linkId
        if (parsed.linkId === linkId && parsed.interviewId) {
          // Check expiration (7 days = 7 * 24 * 60 * 60 * 1000 ms)
          const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
          const now = Date.now();
          const storedTime = parsed.timestamp || 0;
          
          if (now - storedTime > EXPIRATION_MS) {
            // Expired - clear it
            console.log("Stored interviewId has expired, clearing localStorage");
            localStorage.removeItem(`interview_${linkId}`);
            return null;
          }
          
          return parsed.interviewId as Id<"interviews">;
        }
      }
    } catch (error) {
      console.error("Error reading stored interviewId:", error);
      // Clear corrupted data
      try {
        localStorage.removeItem(`interview_${linkId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    return null;
  };

  const [interviewIdState, setInterviewIdState] = useState<Id<"interviews"> | null>(getStoredInterviewId);
  
  // Wrapper to persist interviewId to localStorage
  const setInterviewId = (id: Id<"interviews"> | null) => {
    setInterviewIdState(id);
    if (id) {
      try {
        localStorage.setItem(`interview_${linkId}`, JSON.stringify({
          interviewId: id,
          linkId: linkId,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error("Error saving interviewId to localStorage:", error);
      }
    } else {
      // Clear localStorage when interviewId is cleared
      try {
        localStorage.removeItem(`interview_${linkId}`);
      } catch (error) {
        console.error("Error clearing interviewId from localStorage:", error);
      }
    }
  };

  // Use interviewIdState for all references
  const interviewId = interviewIdState;
  
  const [hasPermissions, setHasPermissions] = useState(false);
  const [intermissionTime, setIntermissionTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<number>(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const isStoppingRef = useRef(false);
  const isCompletingRef = useRef(false);
  const [showTimerCenter, setShowTimerCenter] = useState(false);
  const [showElaborateModal, setShowElaborateModal] = useState(false);
  const [timeLimitExtended, setTimeLimitExtended] = useState(false);
  const [currentTimeLimit, setCurrentTimeLimit] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intermissionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup expired interview entries from localStorage on mount
  useEffect(() => {
    try {
      const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
      const now = Date.now();
      
      // Check all localStorage keys that start with "interview_"
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith("interview_")) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.timestamp && (now - parsed.timestamp > EXPIRATION_MS)) {
                // Expired - remove it
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Corrupted data - remove it
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      // Ignore cleanup errors
      console.error("Error cleaning up expired localStorage entries:", error);
    }
  }, []);

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

  // Validate stored interviewId on mount and when data changes
  useEffect(() => {
    // Don't do anything while data is still loading
    if (data === undefined) {
      return;
    }

    const storedId = getStoredInterviewId();
    
    if (storedId && data?.interview) {
      // Verify the stored interviewId matches the one from the backend
      if (data.interview._id === storedId) {
        // Valid match - use it (already set in state, just verify)
        if (interviewIdState !== storedId) {
          setInterviewIdState(storedId);
        }
        
        // Pre-fill candidate info
        if (data.interview.candidateName) setCandidateName(data.interview.candidateName);
        if (data.interview.candidateEmail) setCandidateEmail(data.interview.candidateEmail);
        
        // If interview is in_progress, resume it
        if (data.interview.status === "in_progress") {
          // Auto-advance to recording if we have permissions
          if (hasPermissions && step !== "recording") {
            setStep("recording");
          }
        } else if (data.interview.status === "completed" || data.interview.status === "analyzed") {
          // Interview is done, clear localStorage and show complete screen
          setInterviewId(null);
          if (step !== "complete") {
            setStep("complete");
          }
        }
      } else {
        // Stored ID doesn't match - clear it (might be from a different session)
        setInterviewId(null);
      }
    } else if (data?.interview && !storedId) {
      // No stored ID, but backend has an interview - use it
      if (data.interview.candidateName) setCandidateName(data.interview.candidateName);
      if (data.interview.candidateEmail) setCandidateEmail(data.interview.candidateEmail);
      
      if (data.interview.status === "in_progress" && data.interview._id) {
        setInterviewId(data.interview._id);
        if (hasPermissions && step !== "recording") {
          setStep("recording");
        }
      }
    } else if (data && !data.interview && storedId) {
      // Data has loaded, but no interview found
      // This means it's a public link (public links have interview: null)
      // For public links, we keep the stored ID - it might be for a different interview
      // and we'll validate it when the user starts a new interview
      // No need to clear here
    } else if (data === null && storedId) {
      // Invalid linkId entirely (not an invite link, not a public link)
      // Clear stored data
      setInterviewId(null);
    }
  }, [data, hasPermissions, linkId, interviewIdState, step]);

  // Show timer in center when question starts, then move to top-right after 3 seconds
  useEffect(() => {
    if (step === "recording" && currentQuestionIndex >= 0) {
      setShowTimerCenter(true);
      setTimeLimitExtended(false);
      const currentQuestion = data?.jobProfile?.questions[currentQuestionIndex];
      const limit = currentQuestion?.timeLimit || 120;
      setCurrentTimeLimit(limit);
      
      const timer = setTimeout(() => {
        setShowTimerCenter(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [step, currentQuestionIndex, data?.jobProfile?.questions]);

  // Reset time limit extension when question changes
  useEffect(() => {
    if (step === "recording") {
      setTimeLimitExtended(false);
    }
  }, [currentQuestionIndex, step]);

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

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 640 },
          height: { ideal: 480, max: 480 },
          frameRate: { ideal: 24, max: 24 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);
      toast.success("Camera and microphone access granted");
      return true;
    } catch (error) {
      console.error("Permission error:", error);
      toast.error("Please allow camera and microphone access to continue");
      return false;
    }
  };

  const handleStart = useCallback(async () => {
    if (!candidateName || !candidateEmail) {
      toast.error("Please enter your name and email");
      return;
    }

    if (isStarting) return; // Prevent double-clicks
    setIsStarting(true);

    try {
      // If we already have an interviewId from a resumed interview, verify it matches
      if (interviewId && data?.interview) {
        // Check if the candidate email matches the existing interview
        if (data.interview.candidateEmail && data.interview.candidateEmail !== candidateEmail) {
          toast.error("This interview link belongs to a different candidate. Please use your own interview link.");
          setIsStarting(false);
          return;
        }
        // If email matches and interview is in_progress, we can proceed
        if (data.interview.status === "in_progress") {
          // Request permissions and continue
          const permissionsGranted = await requestPermissions();
          if (!permissionsGranted) {
            setIsStarting(false);
            return;
          }
          setStep("recording");
          setIsStarting(false);
          return;
        }
      }

      // Request permissions FIRST before creating interview
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        setIsStarting(false);
        return;
      }

      // Only create interview after permissions are granted
      const id = await startInterview({
        linkId,
        candidateName,
        candidateEmail,
      });
      setInterviewId(id);
      setStep("recording");
    } catch (error) {
      console.error("Error starting interview:", error);
      if (error instanceof Error) {
        if (error.message.includes("Interview already started") || 
            error.message.includes("already been used") ||
            error.message.includes("already been completed")) {
          toast.error("This interview link has already been used. Please contact the hiring team for a new link.");
        } else if (error.message.includes("Invalid or expired")) {
          toast.error("This interview link is invalid or has expired.");
        } else {
          toast.error(`Failed to start interview: ${error.message}`);
        }
      } else {
        toast.error("Failed to start interview. Please try again.");
      }
      // Reset permissions if interview creation failed
      setHasPermissions(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } finally {
      setIsStarting(false);
    }
  }, [candidateName, candidateEmail, isStarting, linkId, startInterview, interviewId, data]);

  const startRecording = () => {
    if (!streamRef.current) {
      if (step === "recording") {
          requestPermissions().then(() => {
              if (streamRef.current) startRecording();
          });
      }
      return;
    }

    chunksRef.current = [];
    
    // Check for VP9 support (better compression), fall back to VP8
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm;codecs=vp8,opus";

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 500000,  // 500 kbps for smaller files
      audioBitsPerSecond: 64000,   // 64 kbps for voice
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    // Collect data in 1-second chunks for faster blob creation
    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    setRecordingTime(0);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
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

  const handleComplete = useCallback(async () => {
    // Prevent multiple calls
    if (isCompletingRef.current) {
      console.log("Interview completion already in progress");
      return;
    }
    isCompletingRef.current = true;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (interviewId) {
      try {
        await finalizeInterview({ interviewId });
        toast.success("Interview completed! Responses submitted.");
        // Clear localStorage when interview is completed
        setInterviewId(null);
        setStep("complete");
      } catch (error) {
        console.error("Failed to finalize interview", error);
        toast.error("Failed to complete interview. Please try again or contact support.");
        // Don't set step to "complete" if finalization failed
        // Keep user on current step so they can retry
        isCompletingRef.current = false; // Allow retry
      }
    } else {
      // If no interviewId, still show complete screen but log error
      console.error("Cannot complete interview: interviewId is missing");
      setStep("complete");
    }
  }, [interviewId, finalizeInterview]);

  // Define stopRecordingAndAdvance BEFORE the functions that depend on it
  const stopRecordingAndAdvance = useCallback(async () => {
    if (!mediaRecorderRef.current || !interviewId) {
      isStoppingRef.current = false;
      setIsStopping(false);
      return;
    }

    const mediaRecorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    setIsRecording(false);
    
    const questionIndex = currentQuestionIndex;
    const currentQuestion = data?.jobProfile?.questions[questionIndex];
    const duration = recordingTime;
    // Calculate isLastQuestion inside the callback to use fresh data
    const totalQuestions = data?.jobProfile?.questions.length ?? 0;
    const isLastQuestion = questionIndex >= totalQuestions - 1;
    
    // Immediately transition UI
    if (isLastQuestion) {
        setStep("uploading");
    } else {
        startIntermission();
    }
    
    setUploadQueue(prev => prev + 1);
    setIsUploading(true);
    
    mediaRecorder.onstop = async () => {
      // Use requestAnimationFrame to let UI update first
      requestAnimationFrame(async () => {
        const chunks = chunksRef.current;
        chunksRef.current = [];
        
        const blob = new Blob(chunks, { type: "video/webm" });
        
        if (currentQuestion && interviewId) {
          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              const uploadUrl = await generateUploadUrl();
              const uploadResult = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": blob.type },
                body: blob,
              });
              
              if (!uploadResult.ok) {
                throw new Error(`Upload failed: ${uploadResult.status}`);
              }
              
              const { storageId } = await uploadResult.json();
              await saveResponse({
                interviewId,
                questionId: currentQuestion.id,
                videoStorageId: storageId,
                duration,
                attemptNumber: 1,
                candidateEmail: candidateEmail, // Pass email for verification
              });
              success = true;
            } catch (error) {
              retries--;
              console.error(`Upload attempt failed (${3 - retries}/3):`, error);
              if (retries > 0) {
                await new Promise(r => setTimeout(r, 1000));
              }
            }
          }
          
          if (!success) {
            toast.error("Failed to upload response. Your answer may not be saved.");
          }
        }
        
        setUploadQueue(prev => {
          const newCount = prev - 1;
          if (newCount === 0) setIsUploading(false);
          return newCount;
        });
        
        // Check again if this is the last question (using fresh data)
        // Even if upload failed, we should still try to complete the interview
        // to mark it as completed in the backend
        if (isLastQuestion) {
          // Wait a bit to ensure all uploads are processed, then complete
          setTimeout(async () => {
            try {
              await handleComplete();
            } catch (error) {
              console.error("Error completing interview:", error);
              // If completion fails, show error but don't leave user stuck
              toast.error("Interview may not have been marked as complete. Please contact support.");
            }
          }, 500);
        }
        
        isStoppingRef.current = false;
        setIsStopping(false);
      });
    };
    
    mediaRecorder.stop();
  }, [currentQuestionIndex, data?.jobProfile, interviewId, recordingTime, generateUploadUrl, saveResponse, handleComplete]);

  const handleTimeUp = useCallback(() => {
      // Prevent multiple calls
      if (isStoppingRef.current) return;
      isStoppingRef.current = true;
      setIsStopping(true);
      
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecordingAndAdvance();
  }, [stopRecordingAndAdvance]);

  // Allow user to skip to next question early
  const handleNextQuestion = useCallback(() => {
      if (isStoppingRef.current || !isRecording || isStopping) return;
      
      // Require at least 5 seconds of recording before allowing skip
      if (recordingTime < 5) {
          toast.error("Please record for at least 5 seconds before skipping");
          return;
      }
      
      isStoppingRef.current = true;
      setIsStopping(true);
      if (timerRef.current) clearInterval(timerRef.current);
      stopRecordingAndAdvance();
  }, [isRecording, isStopping, recordingTime, stopRecordingAndAdvance]);

  // Handle "Please elaborate" button click
  const handleElaborate = useCallback(() => {
    const currentQuestion = data?.jobProfile?.questions[currentQuestionIndex];
    if (!currentQuestion || !('elaborateText' in currentQuestion) || !currentQuestion.elaborateText) return;
    
    setShowElaborateModal(true);
    
    // Extend time limit (only once per question)
    if (!timeLimitExtended) {
      const extension = ('elaborateExtensionSeconds' in currentQuestion && currentQuestion.elaborateExtensionSeconds) || 10;
      const baseLimit = currentQuestion.timeLimit || 120;
      setCurrentTimeLimit(baseLimit + extension);
      setTimeLimitExtended(true);
      toast.success(`Time extended by ${extension} seconds`);
    }
  }, [currentQuestionIndex, data?.jobProfile?.questions, timeLimitExtended]);

  // Monitor time limit (accounting for extensions)
  useEffect(() => {
    if (!isRecording || !data?.jobProfile) return;

    const currentQuestion = data.jobProfile.questions[currentQuestionIndex];
    const baseLimit = currentQuestion?.timeLimit || 120;
    const effectiveLimit = timeLimitExtended ? currentTimeLimit : baseLimit;

    if (recordingTime >= effectiveLimit) {
      handleTimeUp();
    }
  }, [recordingTime, isRecording, currentQuestionIndex, data?.jobProfile, timeLimitExtended, currentTimeLimit, handleTimeUp]);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-slate-500 mt-4 text-sm">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="text-center pt-10 pb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Not Found</h2>
            <p className="text-slate-500">This interview link is invalid or has expired. Please contact the hiring team for a new link.</p>
        </CardHeader>
      </Card>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              Oslin <span className="text-slate-400 font-normal">AI Interview</span>
            </h1>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            {/* Job Info Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 md:p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1">{data.jobProfile?.title}</h2>
                  <p className="text-indigo-100 text-sm md:text-base leading-relaxed">{data.jobProfile?.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-sm">
                  <Clock className="w-4 h-4" />
                  {data.jobProfile?.questions.length} Questions
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-sm">
                  <Shield className="w-4 h-4" />
                  Anti-Cheating Enabled
                </div>
              </div>
            </div>

            {/* Form */}
            <CardContent className="p-6 md:p-8 space-y-6">
              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Before you begin
                </p>
                <ul className="text-sm text-amber-700 space-y-1.5 ml-6">
                  <li className="list-disc">Questions flow automatically once started</li>
                  <li className="list-disc">Recording cannot be paused or stopped</li>
                  <li className="list-disc">Answer until the timer runs out</li>
                  <li className="list-disc">No retakes allowed</li>
                </ul>
        </div>

              {/* Input Fields */}
              <div className="space-y-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your full name"
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
            />
                  </div>
          </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="Enter your email"
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
            />
                  </div>
          </div>
        </div>
          </CardContent>

            <CardFooter className="p-6 md:p-8 pt-0">
              <Button 
                size="lg" 
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20" 
                onClick={handleStart} 
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Interview...
                  </>
                ) : (
                  <>
              I'm Ready to Start
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
            </Button>
          </CardFooter>
        </Card>

          <p className="text-center text-slate-400 text-xs mt-6">
            By starting, you agree to have your responses recorded and analyzed
          </p>
        </div>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-3xl border-slate-200 shadow-sm text-center">
          <CardHeader className="pt-12 pb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-2xl border-4 border-indigo-600 border-t-transparent animate-spin" />
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Saving Your Responses</h2>
            <p className="text-slate-500">
              Almost there! We're processing your interview...
            </p>
          </CardHeader>
          <CardContent className="pb-12">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: "85%" }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "complete") {
    const faqItems = data?.jobProfile?.faq || [];
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-2xl w-full space-y-6">
          {/* Success Card */}
          <Card className="rounded-3xl border-slate-200 shadow-sm text-center overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-white">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Interview Complete!</h2>
              <p className="text-emerald-100">Your responses have been submitted successfully</p>
            </div>
            
            <CardContent className="p-8">
              <div className="bg-slate-50 rounded-2xl p-5 mb-6">
                <p className="text-sm text-slate-500 mb-2">We'll contact you at</p>
                <p className="font-semibold text-slate-900 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  {candidateEmail}
                </p>
          </div>
              
              <p className="text-slate-500 text-sm leading-relaxed">
                The hiring team will review your responses and reach out regarding next steps. Thank you for your time!
              </p>
            </CardContent>
            
            <CardFooter className="p-8 pt-0">
              <div className="w-full text-center">
                <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                  <Zap className="w-4 h-4" />
                  Powered by Oslin AI
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* FAQ Section */}
          {faqItems.length > 0 && (
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-indigo-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                    <p className="text-sm text-slate-600">Common questions about this position</p>
                  </div>
                </div>
          </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {faqItems.map((item, idx) => (
                    <div key={item.id} className="space-y-2">
                      <h4 className="font-semibold text-slate-900 flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-sm mt-1">Q{idx + 1}:</span>
                        <span>{item.question}</span>
                      </h4>
                      <p className="text-slate-600 text-sm leading-relaxed pl-6">
                        {item.answer}
                      </p>
                      {idx < faqItems.length - 1 && (
                        <div className="border-b border-slate-100 pt-4" />
                      )}
                    </div>
                  ))}
                </div>
          </CardContent>
        </Card>
          )}
        </div>
      </div>
    );
  }

  // Main Interview UI (Recording or Intermission)
  const currentQuestion = data.jobProfile?.questions[currentQuestionIndex];
  const baseTimeLimit = currentQuestion?.timeLimit || 120; // Fallback default
  // Use extended time limit if elaboration was clicked, otherwise use base
  const effectiveTimeLimit = timeLimitExtended ? currentTimeLimit : baseTimeLimit;
  const timeRemaining = Math.max(0, effectiveTimeLimit - recordingTime);
  const hasElaborateText = !!(currentQuestion && 'elaborateText' in currentQuestion && currentQuestion.elaborateText);

  return (
    <div className="fixed inset-0 bg-slate-900 overflow-hidden z-50 flex flex-col">
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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-900/80 pointer-events-none" />
        </div>

        {/* Top Bar */}
        <div className="relative z-10 p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/10 rounded-full px-4 py-1.5">
                Question {currentQuestionIndex + 1} of {data.jobProfile?.questions.length}
            </Badge>
          </div>
            
            {step === "recording" && !showTimerCenter && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full transition-all duration-500">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-xs font-medium uppercase tracking-wider">REC</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <span className="font-mono font-semibold text-sm">
                Time left: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
              </span>
                </div>
            )}
          </div>

        {/* Center Timer Animation */}
        {step === "recording" && showTimerCenter && (
          <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-3xl px-12 py-8 animate-in zoom-in duration-300">
              <div className="text-center">
                <div className="text-6xl font-mono font-bold text-white mb-2">
                  {Math.floor(baseTimeLimit / 60)}:{(baseTimeLimit % 60).toString().padStart(2, "0")}
                </div>
                <p className="text-white/80 text-sm font-medium">Time limit</p>
              </div>
            </div>
          </div>
        )}

        {/* Center Content: Question Overlay */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-end p-4 pb-8">
            {step === "intermission" ? (
            <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Great job!</h2>
              <p className="text-white/70 mb-8">Next question starting in...</p>
              <div className="text-7xl font-mono font-bold text-indigo-400">
                        {intermissionTime}
                    </div>
                 </div>
            ) : (
            <div className="max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-8 text-center shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500">
              <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-semibold mb-4 uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                {effectiveTimeLimit} seconds to answer
      </div>
                    
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-8">
                        {currentQuestion?.text}
                    </h2>

      {!hasPermissions ? (
                <Button 
                  size="lg" 
                  className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" 
                  onClick={requestPermissions}
                >
                  <Mic className="w-5 h-5 mr-2" />
          Enable Camera & Microphone
                        </Button>
      ) : (
                <div className="flex flex-col items-center gap-5">
                  <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur px-4 py-2 rounded-full border border-red-500/30">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-300 text-sm font-medium">Recording in progress</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {hasElaborateText && (
                      <Button 
                        size="lg" 
                        onClick={handleElaborate}
                        className="h-12 px-6 rounded-xl bg-indigo-600/90 hover:bg-indigo-700 text-white font-semibold backdrop-blur border border-indigo-500/30 transition-all"
                      >
                        <HelpCircle className="w-5 h-5 mr-2" />
                        Please Elaborate
                      </Button>
                    )}
                            
                    <Button 
                      size="lg" 
                      onClick={handleNextQuestion}
                      disabled={recordingTime < 5 || isStopping}
                      className="h-12 px-8 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {isStopping ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <SkipForward className="w-5 h-5 mr-2" />
                          {recordingTime < 5 ? `Wait ${5 - recordingTime}s...` : "Next Question"}
                        </>
                      )}
                    </Button>
                            </div>
                            
                  <p className="text-white/40 text-xs">
                    {hasElaborateText ? "Need more context? Click 'Please Elaborate' for additional details." : "Finished early? Click the button above to continue"}
                            </p>
                        </div>
                    )}
                </div>
          )}
        </div>

        {/* Bottom Bar: Progress */}
        <div className="relative z-10 px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between text-xs font-medium text-white/50 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((currentQuestionIndex + 1) / (data.jobProfile?.questions.length || 1)) * 100)}%</span>
                 </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / (data.jobProfile?.questions.length || 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Elaborate Modal */}
        <Dialog open={showElaborateModal} onOpenChange={setShowElaborateModal}>
          <DialogContent className="max-w-2xl rounded-2xl border-slate-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Additional Context
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-indigo-900 mb-1">Question:</p>
                <p className="text-indigo-800">{currentQuestion?.text}</p>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentQuestion && 'elaborateText' in currentQuestion ? currentQuestion.elaborateText : ''}
                </p>
              </div>
              {timeLimitExtended && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-800 font-medium">
                    Your time has been extended by {currentQuestion && 'elaborateExtensionSeconds' in currentQuestion ? (currentQuestion.elaborateExtensionSeconds || 10) : 10} seconds
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                onClick={() => setShowElaborateModal(false)}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
              >
                Got it, thanks!
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}

