import { ArrowRight, CheckCircle, Zap, Users, Video, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function GettingStarted() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Getting Started</h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Welcome to Oslin AI! This guide will help you get started with our video interview platform.
        </p>
      </div>

      {/* Overview Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-600" />
          What is Oslin AI?
        </h2>
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <p className="text-slate-700 leading-relaxed">
            Oslin is an AI-powered video interview platform that enables recruiters to conduct 
            asynchronous video interviews with candidates. The platform provides automated analysis, 
            question management, and a seamless candidate experience.
          </p>
        </div>
      </section>

      {/* Quick Start for Interviewers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Quick Start for Interviewers
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Access the platform using your credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Use your email and password to sign in to your Oslin account. If you don't have an account, 
                contact your administrator.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <CardTitle>Navigate to Dashboard</CardTitle>
              <CardDescription>Access the main dashboard from the sidebar</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                The dashboard is your central hub. From here you can create job profiles, view interviews, 
                and manage candidates.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <CardTitle>Create Job Profile</CardTitle>
              <CardDescription>Set up your first interview template</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Click "Create Job Profile" to set up a new interview. Add job details, qualifications, 
                and interview questions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:border-indigo-300 transition-colors">
            <CardHeader>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <CardTitle>Share Interview Link</CardTitle>
              <CardDescription>Send the link to candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Copy the public link or create unique invite links. Share with candidates via email 
                or your ATS.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Start for Candidates */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-indigo-600" />
          Quick Start for Candidates
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Receive Link</h3>
              <p className="text-sm text-slate-600">
                You'll receive a unique interview link via email from the hiring team.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Access Interview</h3>
              <p className="text-sm text-slate-600">
                Click the link to access your interview. No account required!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Complete Interview</h3>
              <p className="text-sm text-slate-600">
                Follow the on-screen instructions to complete your interview. Each question has a time limit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Automated scoring, strengths/weaknesses identification, and communication style assessment.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Flexible Question Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Drag-and-drop reordering, shuffle options, time limits, and elaborate text support.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Post-Interview FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Share frequently asked questions with candidates after they complete the interview.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Next Steps */}
      <section className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-8 border border-indigo-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Next Steps</h2>
        <p className="text-slate-700 mb-6">
          Ready to dive deeper? Explore our comprehensive guides:
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            For Interviewers <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
            For Candidates
          </Button>
          <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
            Features Guide
          </Button>
        </div>
      </section>
    </div>
  );
}







