import { 
  Video, 
  Clock, 
  Mic, 
  HelpCircle, 
  SkipForward, 
  CheckCircle, 
  Mail,
  AlertCircle,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ForCandidates() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Guide for Candidates</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Step-by-step guide to completing your video interview on Oslin AI.
        </p>
      </div>

      {/* Before You Start */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-indigo-600" />
          Before You Start
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                Test Your Equipment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">Before starting:</p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Test your camera and microphone</li>
                <li>Ensure good lighting</li>
                <li>Find a quiet environment</li>
                <li>Check internet connection</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Browser Compatibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">Recommended browsers:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Chrome</Badge>
                <Badge variant="outline">Firefox</Badge>
                <Badge variant="outline">Edge</Badge>
                <Badge variant="outline">Safari</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Starting the Interview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-indigo-600" />
          Starting the Interview
        </h2>
        
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">1</span>
                Access the Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Click the interview link provided in your email. No account creation required!
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">2</span>
                Enter Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">You'll need to provide:</p>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Full name</li>
                <li>Email address</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">3</span>
                Review Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Read the interview guidelines carefully. Questions flow automatically once started.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">4</span>
                Click "I'm Ready to Start"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Once you're ready, click the button to begin. Make sure you've granted camera and microphone permissions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* During the Interview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          During the Interview
        </h2>

        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Question Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Timer Display</h4>
                  <p className="text-sm text-slate-600">
                    When a question starts, the time limit appears prominently in the center of the screen 
                    for 3 seconds, then moves to the top-right corner. The timer shows "Time left: MM:SS" format.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Video className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Recording</h4>
                  <p className="text-sm text-slate-600">
                    Recording starts automatically. A red indicator shows recording status. You cannot pause 
                    or stop the recording once it begins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <HelpCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-indigo-900 mb-1">"Please Elaborate" Feature</h4>
                  <p className="text-sm text-indigo-800 mb-2">
                    If available, a "Please Elaborate" button appears next to "Next Question". When clicked:
                  </p>
                  <ul className="text-sm text-indigo-800 space-y-1 ml-4 list-disc">
                    <li>Opens a modal with additional context about the question</li>
                    <li>Automatically extends your time (typically +10 seconds)</li>
                    <li>Can only be used once per question</li>
                    <li>Helps if you need clarification</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <SkipForward className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Moving Forward</h4>
                  <p className="text-sm text-slate-600">
                    You can either wait for the timer to complete, or click "Next Question" after recording 
                    for at least 5 seconds. There's a brief 5-second intermission between questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Progress bar at bottom</span>
                  <Badge variant="outline">Shows completion %</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Question counter</span>
                  <Badge variant="outline">Question X of Y</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tips for Success */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Tips for Success</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Speaking Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Speak clearly and at a moderate pace</li>
                <li>Make eye contact with the camera</li>
                <li>Take a moment to think before answering</li>
                <li>Use the full time if needed</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Technical Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Don't refresh the page during interview</li>
                <li>Complete in one session if possible</li>
                <li>Close other applications using camera</li>
                <li>Use "Please Elaborate" if you need context</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* After Completing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-indigo-600" />
          After Completing the Interview
        </h2>
        
        <div className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Completion Screen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-emerald-900 mb-1">Confirmation</h4>
                  <p className="text-sm text-emerald-800">
                    You'll see a confirmation message that your responses have been submitted successfully.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Email Reference</h4>
                  <p className="text-sm text-slate-600">
                    Your email address is displayed for reference. The hiring team will contact you at this address.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">
                After completion, you'll see a "Frequently Asked Questions" section (if the interviewer added any). 
                This includes common questions about:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">• Next steps</div>
                <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">• Timeline</div>
                <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">• Benefits</div>
                <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">• Company culture</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-900">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-indigo-800">
                The hiring team will review your responses and reach out via email regarding next steps. 
                Thank you for your time!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}


