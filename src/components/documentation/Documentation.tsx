import { useState } from "react";
import { BookOpen, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GettingStarted } from "./pages/GettingStarted";
import { ForInterviewers } from "./pages/ForInterviewers";
import { ForCandidates } from "./pages/ForCandidates";
import { Features } from "./pages/Features";
import { BestPractices } from "./pages/BestPractices";
import { Troubleshooting } from "./pages/Troubleshooting";
import { FAQ } from "./pages/FAQ";

type DocPage = 
  | "getting-started"
  | "for-interviewers"
  | "for-candidates"
  | "features"
  | "best-practices"
  | "troubleshooting"
  | "faq";

interface DocSection {
  id: DocPage;
  title: string;
  icon: React.ReactNode;
}

const docSections: DocSection[] = [
  { id: "getting-started", title: "Getting Started", icon: <BookOpen className="w-4 h-4" /> },
  { id: "for-interviewers", title: "For Interviewers", icon: <BookOpen className="w-4 h-4" /> },
  { id: "for-candidates", title: "For Candidates", icon: <BookOpen className="w-4 h-4" /> },
  { id: "features", title: "Features", icon: <BookOpen className="w-4 h-4" /> },
  { id: "best-practices", title: "Best Practices", icon: <BookOpen className="w-4 h-4" /> },
  { id: "troubleshooting", title: "Troubleshooting", icon: <BookOpen className="w-4 h-4" /> },
  { id: "faq", title: "FAQ", icon: <BookOpen className="w-4 h-4" /> },
];

export function Documentation() {
  const [currentPage, setCurrentPage] = useState<DocPage>("getting-started");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "getting-started":
        return <GettingStarted />;
      case "for-interviewers":
        return <ForInterviewers />;
      case "for-candidates":
        return <ForCandidates />;
      case "features":
        return <Features />;
      case "best-practices":
        return <BestPractices />;
      case "troubleshooting":
        return <Troubleshooting />;
      case "faq":
        return <FAQ />;
      default:
        return <GettingStarted />;
    }
  };

  return (
    <div className="w-full -m-6 md:-m-10">
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Documentation</h1>
                <p className="text-sm text-slate-500">Complete guide to using Oslin AI</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <aside
            className={`${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 fixed md:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 bg-white border-r border-slate-200 overflow-y-auto transition-transform duration-300 z-20 md:z-0`}
          >
            <nav className="p-4 space-y-1">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentPage(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    currentPage === section.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                  {currentPage === section.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-73px)] bg-white">
            <div className="p-6 md:p-10 max-w-4xl mx-auto">
              {renderPage()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

