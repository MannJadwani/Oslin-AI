import { HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "interviewers" | "candidates" | "technical";
}

const faqItems: FAQItem[] = [
  {
    question: "What is Oslin AI?",
    answer: "Oslin AI is an AI-powered video interview platform that enables recruiters to conduct asynchronous video interviews with candidates. It provides automated analysis, question management, and a seamless candidate experience.",
    category: "general"
  },
  {
    question: "Do candidates need to create an account?",
    answer: "No, candidates don't need to create an account. They simply click the interview link provided and enter their name and email to start.",
    category: "candidates"
  },
  {
    question: "How does AI analysis work?",
    answer: "After a candidate completes the interview, our AI analyzes their video responses for content quality, communication style, confidence level, and alignment with job requirements. It provides scores, strengths, weaknesses, and potential red flags.",
    category: "general"
  },
  {
    question: "Can I edit questions after creating a job profile?",
    answer: "Yes! Click the 'Edit' button on any job profile card to modify questions, time limits, FAQ items, or any other settings. Changes are saved immediately.",
    category: "interviewers"
  },
  {
    question: "What happens if a candidate's video doesn't upload?",
    answer: "The platform includes retry logic for uploads. If an upload fails, it will automatically retry up to 3 times. Candidates will see an error message if all retries fail, and they may need to restart the interview.",
    category: "technical"
  },
  {
    question: "Can I shuffle questions for different candidates?",
    answer: "Yes! Enable 'Shuffle questions for every new candidate' when creating or editing a job profile. This randomizes the order of job-specific questions (intro questions never shuffle).",
    category: "interviewers"
  },
  {
    question: "What is the 'Please Elaborate' feature?",
    answer: "This feature allows you to add additional explanatory text to questions. When candidates click 'Please Elaborate', they see a modal with more context and automatically get extra time (default: +10 seconds, configurable).",
    category: "interviewers"
  },
  {
    question: "How long should I set time limits for questions?",
    answer: "Recommended time limits: 60-90 seconds for simple questions, 90-120 seconds for standard behavioral questions, and 120-180 seconds for complex technical questions or case studies.",
    category: "interviewers"
  },
  {
    question: "Can candidates retake questions?",
    answer: "This is configurable per question. When creating questions, you can enable or disable retakes. When disabled, candidates get one attempt only, which helps maintain interview integrity.",
    category: "interviewers"
  },
  {
    question: "What browsers are supported?",
    answer: "Chrome, Firefox, Edge, and Safari are all supported. Chrome is recommended for the best experience. Make sure JavaScript is enabled and you've granted camera/microphone permissions.",
    category: "technical"
  },
  {
    question: "How do I share interview links with candidates?",
    answer: "Each job profile has a unique public link. You can copy this link and share it with candidates via email or your ATS. Alternatively, you can create unique invite links for specific candidates.",
    category: "interviewers"
  },
  {
    question: "What are intro questions?",
    answer: "Intro questions are global questions that appear at the start of every interview you create. They never shuffle and always come before job-specific questions. You can manage them in the Settings tab.",
    category: "interviewers"
  },
  {
    question: "Can I see candidate responses before AI analysis?",
    answer: "Yes! Navigate to the Interviews tab to see all candidate responses. You can watch videos immediately after candidates complete their interviews, even before AI analysis is finished.",
    category: "interviewers"
  },
  {
    question: "What if I need to pause during the interview?",
    answer: "Unfortunately, you cannot pause or stop recording once it begins. This is by design to maintain interview integrity. Make sure you're ready before clicking 'I'm Ready to Start'.",
    category: "candidates"
  },
  {
    question: "How do I add FAQ items?",
    answer: "When creating or editing a job profile, scroll to the 'Post-Interview FAQ' section. Click 'Add FAQ Item' to create new questions and answers. These will be shown to candidates after they complete the interview.",
    category: "interviewers"
  },
  {
    question: "What happens if my timer runs out?",
    answer: "The interview automatically moves to the next question when the timer runs out. Your response up to that point is saved. You can also click 'Next Question' after recording for at least 5 seconds.",
    category: "candidates"
  },
  {
    question: "Can I use 'Please Elaborate' multiple times?",
    answer: "No, the 'Please Elaborate' feature can only be used once per question. This prevents abuse and ensures fair time allocation for all candidates.",
    category: "candidates"
  },
  {
    question: "How accurate is the AI analysis?",
    answer: "AI analysis provides helpful insights and scores, but should be used as a starting point. Always review video responses yourself for complete context and to make final hiring decisions.",
    category: "interviewers"
  },
  {
    question: "What video format is used?",
    answer: "Videos are recorded in WebM format using VP9 codec (with VP8 fallback) for optimal compression and quality. This ensures smaller file sizes while maintaining good video quality.",
    category: "technical"
  },
  {
    question: "Can I archive old job profiles?",
    answer: "Yes! You can archive job profiles that are no longer active. Archived profiles won't appear in the main list but can still be accessed if needed. This helps keep your dashboard organized.",
    category: "interviewers"
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "general" | "interviewers" | "candidates" | "technical">("all");

  const filteredItems = filter === "all" 
    ? faqItems 
    : faqItems.filter(item => item.category === filter);

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General" },
    { id: "interviewers", label: "For Interviewers" },
    { id: "candidates", label: "For Candidates" },
    { id: "technical", label: "Technical" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Find answers to common questions about using Oslin AI.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === cat.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredItems.map((item, index) => (
          <Card 
            key={index} 
            className="border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-900">{item.question}</span>
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </CardTitle>
            </CardHeader>
            {openIndex === index && (
              <CardContent className="pt-0 pb-4">
                <div className="ml-8 pr-8">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Still Have Questions */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-indigo-900">Still Have Questions?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-indigo-800">
            If you can't find the answer you're looking for, please contact your hiring manager, 
            recruiter, or check the other documentation sections for more detailed information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



