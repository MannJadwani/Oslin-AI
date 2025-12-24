import { 
  AlertTriangle, 
  Camera, 
  Mic, 
  Clock, 
  HelpCircle, 
  RefreshCw,
  Wifi,
  Monitor
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Troubleshooting() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Troubleshooting</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Common issues and solutions for using Oslin AI.
        </p>
      </div>

      {/* Camera and Microphone Issues */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-6 h-6 text-indigo-600" />
          Camera & Microphone Issues
        </h2>

        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5" />
                Camera/Microphone Not Working
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900 text-sm">Check browser permissions:</h4>
                <ol className="text-sm text-amber-800 space-y-1 ml-4 list-decimal">
                  <li>Click the lock icon in your browser's address bar</li>
                  <li>Ensure camera and microphone permissions are granted</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900 text-sm">Check other applications:</h4>
                <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                  <li>Close other applications using the camera (Zoom, Teams, etc.)</li>
                  <li>Check if another browser tab is using the camera</li>
                  <li>Restart your browser if needed</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-900 text-sm">Try a different browser:</h4>
                <p className="text-sm text-amber-800">
                  Chrome, Firefox, or Edge usually work best. Safari may have different permission requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>No Video Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Check if your camera is connected and working in other applications
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Try unplugging and reconnecting USB cameras
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Check system settings to ensure camera is enabled
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Microphone Not Picking Up Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Check system microphone settings and volume levels
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Ensure microphone is not muted in system settings
              </div>
              <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
                • Test microphone in another application first
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timer Issues */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Timer Issues
        </h2>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Timer Not Showing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">Wait 3 seconds after question starts:</h4>
              <p className="text-sm text-slate-600">
                The timer appears in the center first, then moves to the top-right corner after 3 seconds.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">Check top-right corner:</h4>
              <p className="text-sm text-slate-600">
                After the initial display, the timer should be visible in the top-right corner showing "Time left: MM:SS".
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-xs text-indigo-700">
                If the timer still doesn't appear, refresh the page and restart the interview.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>"Please Elaborate" Button Missing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-2">
              This feature is optional per question. The button only appears if:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
              <li>The interviewer added elaborate text to the question</li>
              <li>You haven't already used it for this question</li>
            </ul>
            <Badge variant="outline" className="mt-3 bg-slate-50">
              Not all questions have this feature
            </Badge>
          </CardContent>
        </Card>
      </section>

      {/* Recording Issues */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Mic className="w-6 h-6 text-indigo-600" />
          Recording Issues
        </h2>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Recording Not Starting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Ensure you've clicked "Enable Camera & Microphone" and granted permissions
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Check that the red recording indicator appears in the top-right
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Refresh the page and try again if recording doesn't start automatically
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Video Not Saving</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Wait for the upload to complete (you'll see "Saving Your Responses" screen)
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Don't close the browser tab until upload is complete
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Check your internet connection if upload seems stuck
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Connection Issues */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wifi className="w-6 h-6 text-indigo-600" />
          Connection Issues
        </h2>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Slow or Interrupted Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900 text-sm">Check your internet connection:</h4>
              <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                <li>Test your connection speed (recommended: 5+ Mbps)</li>
                <li>Use a wired connection if possible</li>
                <li>Avoid using other bandwidth-intensive applications</li>
              </ul>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium mb-1">Important:</p>
              <p className="text-xs text-amber-800">
                Don't refresh the page during the interview. If you must, you may need to restart the interview.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Browser Issues */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Monitor className="w-6 h-6 text-indigo-600" />
          Browser Issues
        </h2>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Page Not Loading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Clear browser cache and cookies
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Try a different browser (Chrome, Firefox, Edge recommended)
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Disable browser extensions that might interfere
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Check if JavaScript is enabled
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Compatibility Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">Recommended browsers:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                Chrome (Recommended)
              </Badge>
              <Badge variant="outline">Firefox</Badge>
              <Badge variant="outline">Edge</Badge>
              <Badge variant="outline">Safari</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ Not Showing */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          Other Issues
        </h2>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>FAQ Not Showing After Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-2">
              FAQ is optional per job profile. It only appears if:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
              <li>The interviewer added FAQ items to the job profile</li>
              <li>You've completed the interview successfully</li>
            </ul>
            <Badge variant="outline" className="mt-3 bg-slate-50">
              Not all interviews have FAQ sections
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Can't Move to Next Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Wait at least 5 seconds before clicking "Next Question"
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Wait for the timer to complete if "Next Question" is disabled
            </div>
            <div className="p-2 bg-slate-50 rounded text-sm text-slate-600">
              • Don't refresh the page - wait for automatic progression
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Getting Help */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Still Need Help?</h2>
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900">Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-indigo-800 mb-3">
              If you're still experiencing issues:
            </p>
            <ul className="text-sm text-indigo-800 space-y-1 ml-4 list-disc">
              <li>Contact your hiring manager or recruiter</li>
              <li>Check the FAQ section for common questions</li>
              <li>Review the "Best Practices" guide for tips</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}






