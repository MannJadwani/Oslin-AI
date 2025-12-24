import { 
  FileText, 
  Plus, 
  Clock, 
  RefreshCw, 
  GripVertical, 
  HelpCircle, 
  MessageSquare,
  Share2,
  Eye,
  BarChart3,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ForInterviewers() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Guide for Interviewers</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Complete guide to creating and managing video interviews on Oslin AI.
        </p>
      </div>

      {/* Creating a Job Profile */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Creating a Job Profile
        </h2>
        
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</span>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Job Title</h4>
                <p className="text-sm text-slate-600">Enter a clear, descriptive job title (e.g., "Senior Product Designer")</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Job Description</h4>
                <p className="text-sm text-slate-600">Provide a brief overview of the role, responsibilities, and what you're looking for</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Qualifications</h4>
                <p className="text-sm text-slate-600">List required qualifications, skills, or experience. Click "Add Qualification" to add more.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">2</span>
                Interview Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Adding Questions</h4>
                    <p className="text-sm text-slate-600">Click "Add Question" to create new questions. New questions appear at the top for easy editing.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Time Limits</h4>
                    <p className="text-sm text-slate-600">Set custom time limits for each question (optional, default: 120 seconds). Recommended: 60-180 seconds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Retake Control</h4>
                    <p className="text-sm text-slate-600">Enable or disable retakes per question. When disabled, candidates get one attempt only.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <GripVertical className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Reordering Questions</h4>
                    <p className="text-sm text-slate-600">Drag and drop questions using the grip icon to reorder them. Q1 is the first question in the interview.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <HelpCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-indigo-900 mb-1">"Please Elaborate" Feature</h4>
                    <p className="text-sm text-indigo-800">
                      Add additional explanatory text that candidates can request. When clicked, it:
                    </p>
                    <ul className="text-sm text-indigo-800 mt-2 ml-4 list-disc space-y-1">
                      <li>Shows a modal with additional context</li>
                      <li>Automatically extends the timer (default: +10 seconds, configurable)</li>
                      <li>Can only be used once per question</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">3</span>
                Question Shuffling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                Enable "Shuffle questions for every new candidate" to randomize the order of questions for each interview. 
                This helps maintain fairness and prevents answer sharing.
              </p>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Note: Intro questions (if set) never shuffle and always appear first
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">4</span>
                Post-Interview FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Add frequently asked questions that candidates will see after completing the interview.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-slate-900">Recommended FAQ Topics:</h4>
                <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                  <li>Next steps in the hiring process</li>
                  <li>Timeline for decisions</li>
                  <li>Company benefits and culture</li>
                  <li>Remote work policies</li>
                  <li>Team structure and reporting</li>
                  <li>Growth opportunities</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Editing Job Profiles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          Editing Job Profiles
        </h2>
        <Card className="border-slate-200">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
              <p className="text-sm text-slate-600">Click the "Edit" button on any job profile card</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
              <p className="text-sm text-slate-600">Modify any fields: title, description, questions, FAQ, or settings</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
              <p className="text-sm text-slate-600">Click "Update Profile" to save your changes</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sharing Interviews */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-indigo-600" />
          Sharing Interview Links
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Public Link</CardTitle>
              <CardDescription>One link for all candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Each job profile has a unique public link. Share this link with multiple candidates. 
                Each candidate who uses it creates their own interview session.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Unique Invite Links</CardTitle>
              <CardDescription>Individual links per candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Create unique invite links for specific candidates. These can be pre-filled with 
                candidate information and tracked individually.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Managing Interviews */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-indigo-600" />
          Managing Interviews
        </h2>
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Viewing Candidate Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Navigate to the "Interviews" tab to see all candidate responses. You can:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>View candidate information (name, email)</li>
                <li>Watch video responses for each question</li>
                <li>See AI-generated analysis and scores</li>
                <li>Review strengths and weaknesses</li>
                <li>Check communication style assessment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                AI Analysis Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-900">Overall Score</h4>
                  <p className="text-xs text-slate-600">0-100 scale</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-900">Strengths & Weaknesses</h4>
                  <p className="text-xs text-slate-600">Automatically identified</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-900">Communication Style</h4>
                  <p className="text-xs text-slate-600">Speaking pattern analysis</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-slate-900">Red Flags</h4>
                  <p className="text-xs text-slate-600">Potential concerns highlighted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Global Intro Questions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          Global Intro Questions
        </h2>
        <Card className="border-slate-200">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-slate-600">
              Intro questions appear at the start of every interview you create. They never shuffle 
              and always come before job-specific questions.
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-2">To manage intro questions:</h4>
              <ol className="text-sm text-indigo-800 space-y-1 ml-4 list-decimal">
                <li>Go to the Settings tab in the dashboard</li>
                <li>Find the "Intro Questions" section</li>
                <li>Add, edit, or reorder questions</li>
                <li>Save your changes</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}






