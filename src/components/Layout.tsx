import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Video,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "../SignOutButton";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card p-6 gap-6 fixed h-full z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">InterviewAI</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <Button variant="ghost" className="justify-start gap-2 w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
            <Video className="w-4 h-4" />
            Interviews
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
            <Users className="w-4 h-4" />
            Candidates
          </Button>
          <Button variant="ghost" className="justify-start gap-2 w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t">
            <SignOutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">InterviewAI</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-background pt-20 px-6 pb-6 flex flex-col gap-4">
             <nav className="flex flex-col gap-2 flex-1">
                <Button variant="ghost" className="justify-start gap-2 w-full">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                </Button>
                <Button variant="ghost" className="justify-start gap-2 w-full">
                    <Video className="w-4 h-4" />
                    Interviews
                </Button>
                <Button variant="ghost" className="justify-start gap-2 w-full">
                    <Users className="w-4 h-4" />
                    Candidates
                </Button>
                <Button variant="ghost" className="justify-start gap-2 w-full">
                    <Settings className="w-4 h-4" />
                    Settings
                </Button>
            </nav>
            <div className="mt-auto">
                <SignOutButton />
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0">
        <div className="h-full p-8 md:p-12 max-w-7xl mx-auto space-y-8">
            {children}
        </div>
      </main>
    </div>
  );
}

