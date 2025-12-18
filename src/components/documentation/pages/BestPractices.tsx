import { 
  Lightbulb, 
  Users, 
  Video, 
  FileText, 
  Clock, 
  Target,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BestPractices() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Best Practices</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Tips and recommendations for getting the most out of Oslin AI.
        </p>
      </div>

      {/* For Interviewers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          For Interviewers
        </h2>

        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Question Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Keep questions clear and concise</h4>
                    <p className="text-xs text-slate-600">Avoid ambiguity. Candidates should understand what you're asking immediately.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Use "Please Elaborate" for complex questions</h4>
                    <p className="text-xs text-slate-600">Add context for technical questions, case studies, or behavioral scenarios.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Set appropriate time limits</h4>
                    <p className="text-xs text-slate-600">60-180 seconds recommended. Consider question complexity when setting limits.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Test questions before sharing</h4>
                    <p className="text-xs text-slate-600">Review questions for clarity, typos, and appropriate time limits.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                FAQ Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Include 5-10 common questions that candidates typically ask. Recommended topics:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Next steps in process</div>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Timeline for decisions</div>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Benefits and culture</div>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Remote work policies</div>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Team structure</div>
                <div className="p-2 bg-slate-50 rounded text-xs text-slate-600">• Growth opportunities</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Time Limit Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">Simple Questions (60-90 seconds)</h4>
                <p className="text-xs text-slate-600">Basic background, yes/no questions, simple scenarios</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">Standard Questions (90-120 seconds)</h4>
                <p className="text-xs text-slate-600">Most behavioral and situational questions</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">Complex Questions (120-180 seconds)</h4>
                <p className="text-xs text-slate-600">Technical questions, case studies, detailed scenarios</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
                Shuffle Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">
                Enable question shuffling for:
              </p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Fairness across candidates</li>
                <li>Preventing answer sharing</li>
                <li>Maintaining interview integrity</li>
                <li>Reducing bias from question order</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* For Candidates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-indigo-600" />
          For Candidates
        </h2>

        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Preparation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Test equipment beforehand</h4>
                  <p className="text-xs text-slate-600">Camera, microphone, and internet connection</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Ensure good lighting</h4>
                  <p className="text-xs text-slate-600">Face the light source, avoid backlighting</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Find a quiet environment</h4>
                  <p className="text-xs text-slate-600">Minimize background noise and distractions</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Have a stable internet connection</h4>
                  <p className="text-xs text-slate-600">Use wired connection if possible, or strong WiFi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>During Interview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Speak clearly and at a moderate pace</h4>
                    <p className="text-xs text-slate-600">Enunciate words, don't rush</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Make eye contact with the camera</h4>
                    <p className="text-xs text-slate-600">Look at the camera, not the screen</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Use "Please Elaborate" if you need clarification</h4>
                    <p className="text-xs text-slate-600">Don't hesitate to request additional context</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Take advantage of the full time if needed</h4>
                    <p className="text-xs text-slate-600">Don't rush - use the time to give thoughtful answers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Technical Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Use Chrome or Firefox for best compatibility
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Grant camera/microphone permissions when prompted
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Don't refresh the page during the interview
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Complete in one session if possible
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Close other applications using the camera
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* General Tips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">General Tips</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Question Order Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Place simpler questions first to help candidates warm up. Save complex questions for later 
                in the interview.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Use Intro Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Set up global intro questions for consistency. These help candidates get comfortable 
                before job-specific questions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Review AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Use AI analysis as a starting point, but always review video responses yourself for 
                complete context.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Keep FAQ Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Regularly update FAQ based on common candidate questions. This reduces back-and-forth 
                communication.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}



