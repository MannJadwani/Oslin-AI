import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { getAuthUserId } from "@convex-dev/auth/server";

// Model configuration - using latest OpenAI models (2025)
const TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe"; // Latest transcription model, better than Whisper
const ANALYSIS_MODEL = "gpt-4o"; // Flagship model for best analysis quality

// Lazy initialization of OpenAI client to avoid module-level errors
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_API_KEY environment variable. " +
      "Please set it in your Convex dashboard: https://dashboard.convex.dev → Settings → Environment Variables"
    );
  }
  return new OpenAI({ apiKey });
}

// Public mutation to request re-analysis
export const requestAnalysis = mutation({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.interviewerId !== userId) {
      throw new Error("Not authorized");
    }

    if (interview.status !== "completed" && interview.status !== "analyzed") {
      throw new Error("Interview must be completed to be analyzed");
    }

    // Trigger AI analysis
    await ctx.scheduler.runAfter(0, internal.ai.analyzeInterview, {
      interviewId: args.interviewId,
    });
  },
});

export const analyzeInterview = internalAction({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const openai = getOpenAIClient();
    console.log(`Starting analysis for interview: ${args.interviewId}`);
    
    // Get interview data
    const data = await ctx.runQuery(internal.ai.getInterviewData, {
      interviewId: args.interviewId,
    });

    if (!data) {
      throw new Error("Interview not found");
    }

    const { interview, jobProfile, responses } = data;
    console.log(`Found ${responses.length} responses to transcribe`);

    // Transcribe all videos first using GPT-4o transcription
    const transcripts: Record<string, string> = {};
    
    for (const response of responses) {
      try {
        if (response.transcript) {
            console.log(`Using existing transcript for question ${response.questionId}`);
            transcripts[response.questionId] = response.transcript;
            continue;
        }

        console.log(`Transcribing response for question: ${response.questionId}`);
        const videoFile = await ctx.storage.get(response.videoStorageId);
        if (!videoFile) {
          console.log(`No video file found for response: ${response._id}`);
          continue;
        }

        // Create file for transcription API
        const file = new File([videoFile], "video.webm", { type: "video/webm" });

        // Use the latest GPT-4o transcription model
        const transcription = await openai.audio.transcriptions.create({
          file: file,
          model: TRANSCRIPTION_MODEL,
        });

        console.log(`Transcription successful for question ${response.questionId}: ${transcription.text.substring(0, 100)}...`);
        transcripts[response.questionId] = transcription.text;

        // Save transcript
        await ctx.runMutation(internal.ai.saveTranscript, {
          responseId: response._id,
          transcript: transcription.text,
        });
      } catch (error) {
        console.error(`Transcription error for question ${response.questionId}:`, error);
        transcripts[response.questionId] = "[Transcription failed]";
      }
    }

    console.log(`Transcription complete. Analyzing with ${ANALYSIS_MODEL}...`);

    // Analyze with GPT-4o (flagship model)
    const analysisPrompt = `You are an expert HR analyst. Analyze this job interview based on the following information:

Job Title: ${jobProfile.title}
Job Description: ${jobProfile.description}
Required Qualifications: ${jobProfile.qualifications.join(", ")}

Interview Questions and Responses:
${jobProfile.questions.map((q: { id: string; text: string }, idx: number) => {
  const transcript = transcripts[q.id] || "[No response]";
  return `Q${idx + 1}: ${q.text}\nA${idx + 1}: ${transcript}`;
}).join("\n\n")}

Provide a comprehensive analysis in the following JSON format:
{
  "overallScore": <number 0-100>,
  "strengths": [<array of key strengths>],
  "weaknesses": [<array of areas for improvement>],
  "communicationStyle": "<brief description>",
  "confidenceLevel": "<low/medium/high with brief explanation>",
  "skillAlignment": "<how well skills match job requirements>",
  "redFlags": [<array of any concerns>],
  "summary": "<2-3 sentence overall assessment>",
  "questionAnalyses": [
    {
      "questionId": "<question id>",
      "score": <number 0-100>,
      "feedback": "<specific feedback for this answer>"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
    });

    console.log(`Analysis complete. Overall score: ${JSON.parse(completion.choices[0].message.content || "{}").overallScore}`);

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No analysis generated");
    }

    const analysis = JSON.parse(analysisText);

    // Save analysis
    await ctx.runMutation(internal.ai.saveAnalysis, {
      interviewId: args.interviewId,
      analysis: {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        communicationStyle: analysis.communicationStyle,
        confidenceLevel: analysis.confidenceLevel,
        skillAlignment: analysis.skillAlignment,
        redFlags: analysis.redFlags,
        summary: analysis.summary,
        questionAnalyses: analysis.questionAnalyses,
      },
    });

    await ctx.runMutation(internal.interviews.markAnalyzed, {
      interviewId: args.interviewId,
    });
  },
});

export const getInterviewData = internalQuery({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) return null;

    const jobProfile = await ctx.db.get(interview.jobProfileId);
    if (!jobProfile) return null;

    const responses = await ctx.db
      .query("responses")
      .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
      .collect();

    return { interview, jobProfile, responses };
  },
});

export const saveTranscript = internalMutation({
  args: {
    responseId: v.id("responses"),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.responseId, {
      transcript: args.transcript,
    });
  },
});

export const saveAnalysis = internalMutation({
  args: {
    interviewId: v.id("interviews"),
    analysis: v.object({
      overallScore: v.number(),
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      communicationStyle: v.string(),
      confidenceLevel: v.string(),
      skillAlignment: v.string(),
      redFlags: v.array(v.string()),
      summary: v.string(),
      questionAnalyses: v.array(v.object({
        questionId: v.string(),
        score: v.number(),
        feedback: v.string(),
      })),
    }),
  },
  handler: async (ctx, args) => {
    // Check if analysis already exists, if so replace it, otherwise insert
    const existing = await ctx.db
        .query("analyses")
        .withIndex("by_interview", (q) => q.eq("interviewId", args.interviewId))
        .first();

    if (existing) {
        await ctx.db.replace(existing._id, {
            interviewId: args.interviewId,
            ...args.analysis
        });
    } else {
        await ctx.db.insert("analyses", {
            interviewId: args.interviewId,
            ...args.analysis,
        });
    }
  },
});

// Test action to verify OpenAI connection is working
import { action } from "./_generated/server";

export const testOpenAIConnection = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    models: v.optional(v.object({
      transcription: v.string(),
      analysis: v.string(),
    })),
  }),
  handler: async () => {
    try {
      const openai = getOpenAIClient();
      
      // Test with a simple chat completion
      const completion = await openai.chat.completions.create({
        model: ANALYSIS_MODEL,
        messages: [{ role: "user", content: "Say 'OpenAI connection successful!' in exactly those words." }],
        max_tokens: 20,
      });

      const response = completion.choices[0].message.content || "";
      
      return {
        success: true,
        message: `✅ OpenAI connected! Response: "${response}"`,
        models: {
          transcription: TRANSCRIPTION_MODEL,
          analysis: ANALYSIS_MODEL,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        message: `❌ OpenAI connection failed: ${errorMessage}`,
      };
    }
  },
});
