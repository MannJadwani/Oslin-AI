import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// Demo job profiles with realistic interview questions
const demoJobProfiles = [
  {
    title: "Senior Software Engineer",
    description: "We're looking for an experienced software engineer to join our platform team. You'll be working on scalable distributed systems and mentoring junior developers.",
    qualifications: [
      "5+ years of software development experience",
      "Proficiency in TypeScript, Python, or Go",
      "Experience with distributed systems and microservices",
      "Strong problem-solving and communication skills",
      "Bachelor's degree in Computer Science or equivalent experience",
    ],
    questions: [
      {
        id: "q1",
        text: "Tell us about yourself and your experience as a software engineer.",
        timeLimit: 120,
        allowRetake: true,
      },
      {
        id: "q2",
        text: "Describe a challenging technical problem you've solved. What was your approach?",
        timeLimit: 180,
        allowRetake: true,
      },
      {
        id: "q3",
        text: "How do you approach code reviews? What do you look for?",
        timeLimit: 120,
        allowRetake: false,
      },
      {
        id: "q4",
        text: "Tell us about a time you had to mentor a junior developer. How did you approach it?",
        timeLimit: 120,
        allowRetake: true,
      },
      {
        id: "q5",
        text: "Where do you see yourself in 5 years, and why are you interested in this role?",
        timeLimit: 90,
        allowRetake: false,
      },
    ],
    status: "active" as const,
  },
  {
    title: "Product Manager",
    description: "Join our product team to drive the vision and strategy for our B2B SaaS platform. You'll work closely with engineering, design, and stakeholders.",
    qualifications: [
      "3+ years of product management experience",
      "Experience with B2B SaaS products",
      "Strong analytical and data-driven mindset",
      "Excellent communication and stakeholder management",
      "Familiarity with agile methodologies",
    ],
    questions: [
      {
        id: "q1",
        text: "Walk us through your product management experience and a product you're most proud of.",
        timeLimit: 150,
        allowRetake: true,
      },
      {
        id: "q2",
        text: "How do you prioritize features when you have limited resources and competing stakeholder demands?",
        timeLimit: 180,
        allowRetake: true,
      },
      {
        id: "q3",
        text: "Describe a time when you had to make a difficult product decision with incomplete data.",
        timeLimit: 150,
        allowRetake: false,
      },
      {
        id: "q4",
        text: "How do you measure the success of a product feature after launch?",
        timeLimit: 120,
        allowRetake: true,
      },
    ],
    status: "active" as const,
  },
  {
    title: "UX Designer",
    description: "We're seeking a creative UX Designer to craft intuitive and delightful user experiences for our mobile and web applications.",
    qualifications: [
      "3+ years of UX/UI design experience",
      "Strong portfolio demonstrating user-centered design process",
      "Proficiency in Figma or similar design tools",
      "Experience conducting user research and usability testing",
      "Understanding of accessibility standards",
    ],
    questions: [
      {
        id: "q1",
        text: "Tell us about your design background and walk us through a project in your portfolio.",
        timeLimit: 180,
        allowRetake: true,
      },
      {
        id: "q2",
        text: "Describe your user research process. How do you gather and incorporate user feedback?",
        timeLimit: 150,
        allowRetake: true,
      },
      {
        id: "q3",
        text: "How do you handle design feedback from stakeholders that you disagree with?",
        timeLimit: 120,
        allowRetake: false,
      },
      {
        id: "q4",
        text: "What's your approach to designing for accessibility?",
        timeLimit: 120,
        allowRetake: true,
      },
    ],
    status: "active" as const,
  },
  {
    title: "Marketing Manager",
    description: "Lead our marketing initiatives to drive brand awareness and customer acquisition for our growing startup.",
    qualifications: [
      "4+ years of marketing experience, preferably in tech",
      "Experience with digital marketing channels (SEO, SEM, social media)",
      "Strong analytical skills and experience with marketing analytics",
      "Excellent written and verbal communication",
      "Experience managing marketing budgets",
    ],
    questions: [
      {
        id: "q1",
        text: "Tell us about your marketing background and a campaign you're particularly proud of.",
        timeLimit: 150,
        allowRetake: true,
      },
      {
        id: "q2",
        text: "How do you approach marketing for a B2B tech product with a limited budget?",
        timeLimit: 150,
        allowRetake: true,
      },
      {
        id: "q3",
        text: "Describe how you measure marketing ROI and what metrics you prioritize.",
        timeLimit: 120,
        allowRetake: false,
      },
    ],
    status: "active" as const,
  },
  {
    title: "Customer Success Manager",
    description: "Help our customers achieve their goals and drive product adoption as a Customer Success Manager.",
    qualifications: [
      "2+ years of customer success or account management experience",
      "Excellent communication and relationship-building skills",
      "Experience with CRM tools (Salesforce, HubSpot)",
      "Ability to understand technical products",
      "Strong problem-solving skills",
    ],
    questions: [
      {
        id: "q1",
        text: "What does customer success mean to you, and why are you passionate about this role?",
        timeLimit: 120,
        allowRetake: true,
      },
      {
        id: "q2",
        text: "Describe a time when you turned around a dissatisfied customer. What was your approach?",
        timeLimit: 150,
        allowRetake: true,
      },
      {
        id: "q3",
        text: "How do you prioritize your time when managing multiple customer accounts?",
        timeLimit: 120,
        allowRetake: false,
      },
      {
        id: "q4",
        text: "How do you identify upsell or expansion opportunities with existing customers?",
        timeLimit: 120,
        allowRetake: true,
      },
    ],
    status: "active" as const,
  },
];

// Sample candidate names for demo interviews
const demoCandidates = [
  { name: "Alex Johnson", email: "alex.johnson@email.com" },
  { name: "Sarah Chen", email: "sarah.chen@email.com" },
  { name: "Michael Brown", email: "m.brown@email.com" },
  { name: "Emily Davis", email: "emily.d@email.com" },
  { name: "James Wilson", email: "jwilson@email.com" },
  { name: "Maria Garcia", email: "maria.garcia@email.com" },
  { name: "David Kim", email: "dkim@email.com" },
  { name: "Lisa Anderson", email: "l.anderson@email.com" },
];

// Sample analyses for completed interviews
const sampleAnalyses = [
  {
    overallScore: 85,
    strengths: [
      "Excellent communication skills",
      "Strong technical background",
      "Good problem-solving approach",
      "Shows leadership potential",
    ],
    weaknesses: [
      "Could provide more specific examples",
      "Limited experience with distributed systems",
    ],
    communicationStyle: "Clear, confident, and articulate. Uses concrete examples effectively.",
    confidenceLevel: "High - maintained good eye contact and spoke with conviction",
    skillAlignment: "Strong alignment with core requirements. Technical skills match well with the role.",
    redFlags: [],
    summary: "A strong candidate with excellent communication skills and solid technical foundation. Would be a great fit for the team culture and has potential for growth.",
  },
  {
    overallScore: 72,
    strengths: [
      "Enthusiastic about the role",
      "Good cultural fit",
      "Strong analytical thinking",
    ],
    weaknesses: [
      "Could improve on technical depth",
      "Needs more experience with stakeholder management",
      "Some answers were too brief",
    ],
    communicationStyle: "Friendly and approachable, but occasionally lacks structure in responses.",
    confidenceLevel: "Medium - showed some nervousness but recovered well",
    skillAlignment: "Partial alignment. Has foundational skills but may need additional training.",
    redFlags: ["Limited experience in the specific domain"],
    summary: "A promising candidate with good potential. May require additional onboarding support but shows willingness to learn and grow.",
  },
  {
    overallScore: 91,
    strengths: [
      "Exceptional problem-solving skills",
      "Deep domain expertise",
      "Strong leadership experience",
      "Excellent at explaining complex concepts",
      "Great cultural fit",
    ],
    weaknesses: [
      "May be overqualified for some aspects of the role",
    ],
    communicationStyle: "Highly articulate with excellent storytelling ability. Balances technical depth with accessibility.",
    confidenceLevel: "High - very comfortable and natural throughout the interview",
    skillAlignment: "Excellent alignment across all requirements. Exceeds expectations in several areas.",
    redFlags: [],
    summary: "An outstanding candidate who would bring significant value to the team. Highly recommend moving forward with the hiring process.",
  },
];

function generateLinkId(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export const seedDemoData = internalMutation({
  args: { userId: v.id("users") },
  returns: v.object({
    jobProfilesCreated: v.number(),
    interviewsCreated: v.number(),
  }),
  handler: async (ctx, args) => {
    const { userId } = args;

    // Create job profiles
    const jobProfileIds = [];
    for (const profile of demoJobProfiles) {
      const id = await ctx.db.insert("jobProfiles", {
        ...profile,
        interviewerId: userId,
      });
      jobProfileIds.push(id);
    }

    // Create sample interviews for each job profile
    let interviewsCreated = 0;
    const now = Date.now();

    for (let i = 0; i < jobProfileIds.length; i++) {
      const jobProfileId = jobProfileIds[i];
      const numInterviews = Math.floor(Math.random() * 3) + 2; // 2-4 interviews per profile

      for (let j = 0; j < numInterviews; j++) {
        const candidate = demoCandidates[(i * 3 + j) % demoCandidates.length];
        const statusOptions = ["pending", "in_progress", "completed", "analyzed"] as const;
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        const interviewData: {
          jobProfileId: typeof jobProfileId;
          interviewerId: typeof userId;
          linkId: string;
          candidateName?: string;
          candidateEmail?: string;
          status: typeof status;
          startedAt?: number;
          completedAt?: number;
        } = {
          jobProfileId,
          interviewerId: userId,
          linkId: generateLinkId(),
          status,
        };

        // Add candidate info for non-pending interviews
        if (status !== "pending") {
          interviewData.candidateName = candidate.name;
          interviewData.candidateEmail = candidate.email;
          interviewData.startedAt = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // Within last week
        }

        // Add completion time for completed/analyzed interviews
        if (status === "completed" || status === "analyzed") {
          interviewData.completedAt = interviewData.startedAt! + Math.floor(Math.random() * 30 * 60 * 1000); // 0-30 min after start
        }

        const interviewId = await ctx.db.insert("interviews", interviewData);

        // Add analysis for analyzed interviews
        if (status === "analyzed") {
          const sampleAnalysis = sampleAnalyses[Math.floor(Math.random() * sampleAnalyses.length)];
          const jobProfile = demoJobProfiles[i];
          
          await ctx.db.insert("analyses", {
            interviewId,
            ...sampleAnalysis,
            questionAnalyses: jobProfile.questions.map((q, idx) => ({
              questionId: q.id,
              score: Math.floor(Math.random() * 30) + 70, // 70-100
              feedback: `Good response demonstrating ${idx % 2 === 0 ? "strong understanding" : "relevant experience"}. ${idx % 3 === 0 ? "Could elaborate more on specific outcomes." : ""}`,
            })),
          });
        }

        interviewsCreated++;
      }
    }

    return {
      jobProfilesCreated: jobProfileIds.length,
      interviewsCreated,
    };
  },
});

// Public mutation to trigger seeding (requires authentication)
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const loadDemoData = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    jobProfilesCreated: v.optional(v.number()),
    interviewsCreated: v.optional(v.number()),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        success: false,
        message: "You must be logged in to load demo data",
      };
    }

    // Check if user already has data
    const existingProfiles = await ctx.db
      .query("jobProfiles")
      .withIndex("by_interviewer", (q) => q.eq("interviewerId", userId))
      .take(1);

    if (existingProfiles.length > 0) {
      return {
        success: false,
        message: "You already have job profiles. Demo data is only loaded for new accounts.",
      };
    }

    // Create demo data directly (inline the logic to avoid internal mutation call)
    const jobProfileIds = [];
    for (const profile of demoJobProfiles) {
      const id = await ctx.db.insert("jobProfiles", {
        ...profile,
        interviewerId: userId,
      });
      jobProfileIds.push(id);
    }

    let interviewsCreated = 0;
    const now = Date.now();

    for (let i = 0; i < jobProfileIds.length; i++) {
      const jobProfileId = jobProfileIds[i];
      const numInterviews = Math.floor(Math.random() * 3) + 2;

      for (let j = 0; j < numInterviews; j++) {
        const candidate = demoCandidates[(i * 3 + j) % demoCandidates.length];
        const statusOptions = ["pending", "in_progress", "completed", "analyzed"] as const;
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];

        const interviewData: {
          jobProfileId: typeof jobProfileId;
          interviewerId: typeof userId;
          linkId: string;
          candidateName?: string;
          candidateEmail?: string;
          status: typeof status;
          startedAt?: number;
          completedAt?: number;
        } = {
          jobProfileId,
          interviewerId: userId,
          linkId: generateLinkId(),
          status,
        };

        if (status !== "pending") {
          interviewData.candidateName = candidate.name;
          interviewData.candidateEmail = candidate.email;
          interviewData.startedAt = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
        }

        if (status === "completed" || status === "analyzed") {
          interviewData.completedAt = interviewData.startedAt! + Math.floor(Math.random() * 30 * 60 * 1000);
        }

        const interviewId = await ctx.db.insert("interviews", interviewData);

        if (status === "analyzed") {
          const sampleAnalysis = sampleAnalyses[Math.floor(Math.random() * sampleAnalyses.length)];
          const jobProfile = demoJobProfiles[i];
          
          await ctx.db.insert("analyses", {
            interviewId,
            ...sampleAnalysis,
            questionAnalyses: jobProfile.questions.map((q, idx) => ({
              questionId: q.id,
              score: Math.floor(Math.random() * 30) + 70,
              feedback: `Good response demonstrating ${idx % 2 === 0 ? "strong understanding" : "relevant experience"}. ${idx % 3 === 0 ? "Could elaborate more on specific outcomes." : ""}`,
            })),
          });
        }

        interviewsCreated++;
      }
    }

    return {
      success: true,
      message: `Successfully loaded demo data!`,
      jobProfilesCreated: jobProfileIds.length,
      interviewsCreated,
    };
  },
});















