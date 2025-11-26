import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface CandidateInterviewProps {
  linkId: string;
}

export function CandidateInterview({ linkId }: CandidateInterviewProps) {
  const data = useQuery(api.interviews.getByLink, { linkId });
  const startInterview = useMutation(api.interviews.startInterview);
  const generateUploadUrl = useMutation(api.responses.generateUploadUrl);
  const saveResponse = useMutation(api.responses.saveResponse);
  const finalizeInterview = useMutation(api.responses.finalizeInterview);

  const [step, setStep] = useState<"intro" | "recording" | "complete">("intro");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interviewId, setInterviewId] = useState<Id<"interviews"> | null>(null);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [hasPermissions, setHasPermissions] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
      setStep("recording");
      await requestPermissions();
    } catch (error) {
      toast.error("Failed to start interview");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      toast.error("Camera not ready");
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

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1;
        const currentQuestion = data?.jobProfile?.questions[currentQuestionIndex];
        if (currentQuestion?.timeLimit && newTime >= currentQuestion.timeLimit) {
          stopRecording();
        }
        return newTime;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !interviewId) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      mediaRecorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const currentQuestion = data?.jobProfile?.questions[currentQuestionIndex];
        
        if (!currentQuestion) return;

        try {
          const uploadUrl = await generateUploadUrl();
          const uploadResult = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });

          const { storageId } = await uploadResult.json();
          
          const attemptNumber = (attempts[currentQuestion.id] || 0) + 1;
          setAttempts(prev => ({ ...prev, [currentQuestion.id]: attemptNumber }));

          await saveResponse({
            interviewId,
            questionId: currentQuestion.id,
            videoStorageId: storageId,
            duration: recordingTime,
            attemptNumber,
          });

          toast.success("Response saved!");
          resolve();
        } catch (error) {
          toast.error("Failed to save response");
          resolve();
        }
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });
  };

  const handleNext = async () => {
    if (isRecording) {
      await stopRecording();
    }

    if (data?.jobProfile && currentQuestionIndex < data.jobProfile.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordingTime(0);
    } else {
      await handleComplete();
    }
  };

  const handleRetake = () => {
    setRecordingTime(0);
  };

  const handleComplete = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (interviewId) {
      try {
        await finalizeInterview({ interviewId });
        setStep("complete");
        toast.success("Interview completed! AI analysis will be ready soon.");
      } catch (error) {
        toast.error("Failed to finalize interview");
      }
    }
  };

  if (data === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Interview Not Found</h2>
        <p className="text-gray-600">This interview link is invalid or has expired.</p>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-4">Video Interview</h1>
        <h2 className="text-xl text-gray-700 mb-6">{data.jobProfile?.title}</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">{data.jobProfile?.description}</p>
          <p className="text-sm text-gray-500">
            This interview has {data.jobProfile?.questions.length} questions. 
            You'll record a video response for each question.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Email</label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Start Interview
        </button>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Interview Complete!</h2>
          <p className="text-gray-600 mb-2">
            Thank you for completing the interview. Your responses have been submitted successfully.
          </p>
          <p className="text-sm text-gray-500">
            The hiring team will review your responses and AI analysis, and will contact you at {candidateEmail} if they'd like to move forward.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = data.jobProfile?.questions[currentQuestionIndex];
  const canRetake = currentQuestion?.allowRetake && !isRecording;
  const timeLimit = currentQuestion?.timeLimit;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} of {data.jobProfile?.questions.length}
          </h2>
          {timeLimit && (
            <span className="text-sm text-gray-500">
              Time limit: {timeLimit}s
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / (data.jobProfile?.questions.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">{currentQuestion?.text}</h3>
      </div>

      <div className="mb-6">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded-lg bg-black"
          style={{ maxHeight: "400px" }}
        />
        {isRecording && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            <span className="font-mono text-lg">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
            </span>
            {timeLimit && (
              <span className="text-sm text-gray-500">
                / {Math.floor(timeLimit / 60)}:{(timeLimit % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        )}
      </div>

      {!hasPermissions ? (
        <button
          onClick={requestPermissions}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Enable Camera & Microphone
        </button>
      ) : (
        <div className="flex gap-3">
          {!isRecording ? (
            <>
              <button
                onClick={startRecording}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {attempts[currentQuestion?.id || ""] ? "Re-record" : "Start Recording"}
              </button>
              {attempts[currentQuestion?.id || ""] && (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                >
                  {currentQuestionIndex < (data.jobProfile?.questions.length || 0) - 1 ? "Next Question" : "Complete Interview"}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={stopRecording}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Stop Recording
            </button>
          )}
        </div>
      )}

      {canRetake && attempts[currentQuestion?.id || ""] && (
        <p className="text-sm text-gray-500 text-center mt-2">
          You can retake this question if needed
        </p>
      )}
    </div>
  );
}
