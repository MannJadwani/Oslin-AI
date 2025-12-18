import { 
  Sparkles, 
  GripVertical, 
  RefreshCw, 
  Clock, 
  HelpCircle, 
  MessageSquare,
  BarChart3,
  Zap,
  Shield,
  Video
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Features() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Features</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Comprehensive overview of all features available in Oslin AI.
        </p>
      </div>

      {/* Question Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <GripVertical className="w-6 h-6 text-indigo-600" />
          Question Management
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="w-5 h-5 text-indigo-600" />
                Drag and Drop Reordering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Easily reorder questions by dragging and dropping. Questions are numbered automatically, 
                and Q1 is always the first question in the interview.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-600" />
                Question Shuffling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Enable shuffling to randomize question order for each candidate. Helps maintain fairness 
                and prevents answer sharing. Intro questions never shuffle.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Custom Time Limits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Set individual time limits for each question (optional, default: 120 seconds). 
                Recommended range: 60-180 seconds based on question complexity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Retake Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Enable or disable retakes per question. When disabled, candidates get one attempt only, 
                helping maintain interview integrity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Please Elaborate Feature */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          "Please Elaborate" Feature
        </h2>
        
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle>Enhanced Question Context</CardTitle>
            <CardDescription>Help candidates understand questions better</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-indigo-900">How it works:</h4>
              <ul className="text-sm text-indigo-800 space-y-1 ml-4 list-disc">
                <li>Add optional explanatory text to any question</li>
                <li>Candidates see a "Please Elaborate" button when available</li>
                <li>Clicking opens a modal with additional context</li>
                <li>Automatically extends timer (default: +10 seconds, configurable)</li>
                <li>Can only be used once per question</li>
              </ul>
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium mb-1">Use Cases:</p>
              <p className="text-xs text-indigo-600">
                Complex technical questions, behavioral scenarios, case studies, or any question 
                that benefits from additional context.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Timer Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Timer Features
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Prominent Display</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">
                When a question starts, the time limit appears prominently in the center of the screen 
                in large format (MM:SS).
              </p>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Shows for 3 seconds
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Smooth Animation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">
                After 3 seconds, the timer smoothly transitions to the top-right corner where it remains 
                during the question.
              </p>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                "Time left: MM:SS" format
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Post-Interview FAQ */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Post-Interview FAQ
        </h2>
        
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Flexible FAQ Management</CardTitle>
            <CardDescription>Share information with candidates after interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Add frequently asked questions that candidates see after completing the interview. 
              Each FAQ item includes:
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">Question</h4>
                <p className="text-xs text-slate-600">Clear, concise question text</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">Answer</h4>
                <p className="text-xs text-slate-600">Detailed answer with all relevant information</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium mb-1">Recommended Topics:</p>
              <p className="text-xs text-indigo-600">
                Next steps, timeline, benefits, culture, remote work, team structure, growth opportunities
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* AI Analysis */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          AI-Powered Analysis
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Automated scoring on a 0-100 scale based on response quality, relevance, and communication.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Strengths & Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Automatically identified key strengths and areas for improvement in candidate responses.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Communication Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Assessment of speaking patterns, clarity, confidence level, and communication effectiveness.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Skill Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Evaluation of how well candidate responses align with job requirements and qualifications.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Red Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Potential concerns or inconsistencies highlighted for interviewer review.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Question-Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Individual scores and feedback for each question, helping identify specific areas of strength.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Global Intro Questions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-600" />
          Global Intro Questions
        </h2>
        
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Consistent Interview Start</CardTitle>
            <CardDescription>Questions that appear at the start of every interview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              Set up intro questions that appear at the beginning of every interview you create. 
              These questions:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
              <li>Never shuffle (always in the same order)</li>
              <li>Always appear before job-specific questions</li>
              <li>Support all question features (time limits, elaborate text, etc.)</li>
              <li>Can be managed in the Settings tab</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Video Recording */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-indigo-600" />
          Video Recording
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Optimized Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                High-quality video recording with optimized compression (VP9 codec) for smaller file sizes 
                while maintaining quality.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Automatic Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Videos are automatically uploaded and processed. AI analysis begins immediately after 
                interview completion.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}



