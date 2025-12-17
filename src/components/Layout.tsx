import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Video,
  Settings,
  Menu,
  Zap,
  User,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { SignOutButton } from "../SignOutButton";
import { useDashboard } from "../lib/DashboardContext";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentView, setCurrentView } = useDashboard();
  const user = useQuery(api.auth.loggedInUser);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "interviews", label: "Interviews", icon: Video },
    { id: "candidates", label: "Candidates", icon: Users },
    { id: "documentation", label: "Documentation", icon: BookOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "GU";
    
  const userName = user?.email ? user.email.split('@')[0] : "Guest User";

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 border-r border-slate-200 bg-white px-6 py-8 gap-8 fixed h-full z-10">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
             <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Oslin<span className="text-slate-400 font-medium">AI</span>
          </span>
        </div>

        <div className="flex-1 py-6">
            <div className="px-4 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Main Menu
            </div>
            <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
                <Button
                key={item.id}
                variant="ghost"
                className={`justify-start gap-3 w-full h-11 rounded-xl font-medium px-4 transition-all duration-200 group ${
                    currentView === item.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => setCurrentView(item.id)}
                >
                <item.icon className={`w-5 h-5 transition-colors ${currentView === item.id ? "text-indigo-200" : "text-slate-400 group-hover:text-indigo-600"}`} />
                {item.label}
          </Button>
            ))}
        </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 px-2">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {user?.image ? (
                    <img src={user.image} alt="User" className="w-10 h-10 rounded-xl border border-slate-200" />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {userInitials}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                        {userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                        {user?.email || "Anonymous Session"}
                    </p>
                </div>
            </div>
            <SignOutButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
                Oslin<span className="text-slate-400 font-medium">AI</span>
            </span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="w-5 h-5 text-slate-600" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-white pt-20 px-6 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-5 duration-200">
             <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => (
                    <Button
                    key={item.id}
                    variant={currentView === item.id ? "secondary" : "ghost"}
                    className={`justify-start gap-3 w-full h-12 rounded-xl text-lg font-medium ${
                        currentView === item.id 
                        ? "bg-indigo-600 text-white" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                    onClick={() => {
                        setCurrentView(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                    >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                </Button>
                ))}
            </nav>
            <div className="mt-auto">
                <SignOutButton />
            </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pl-72 pt-16 md:pt-0 min-h-screen bg-slate-50/50">
        <div className="h-full p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {children}
        </div>
      </main>
    </div>
  );
}

