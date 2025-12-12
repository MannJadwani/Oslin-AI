import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Play, Shield, Users, Brain, CheckCircle, Video } from "lucide-react";
import { useState } from "react";
import { SignInForm } from "../SignInForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Dot Grid Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ 
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}
      />

      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full px-6 py-3 shadow-lg shadow-slate-200/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Oslin<span className="text-slate-400 font-medium">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full text-slate-600 hover:text-primary hover:bg-primary/5 hidden sm:flex">
                        Log In
                    </Button>
                </DialogTrigger>
            </Dialog>
            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/20">
                        Get Started
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                        <SignInForm />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 pt-32 md:pt-48 pb-20 container mx-auto px-4">
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center max-w-6xl mx-auto"
        >
            {/* Hero Top: Typography & Buttons */}
            <div className="max-w-3xl mx-auto mb-16">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-8 mx-auto">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Hiring Engine v2.0</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                    Accelerate Hiring At <br/>
                    <span className="inline-flex items-center gap-3 align-middle">
                        Your Company
                        <div className="relative inline-flex h-10 w-16 rounded-full bg-blue-100 border border-blue-200 items-center px-1 justify-end cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-blue-600 shadow-sm" />
                        </div>
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Oslin's modular AI platform takes the heavy lifting out of screening. 
                    Start securely getting top talent into interviews today.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                     <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-base font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                        Book a demo
                    </Button>
                    
                    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="h-14 px-8 rounded-full text-base font-semibold bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300 border border-blue-700">
                                Integrate now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                    </Dialog>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-8 grayscale opacity-60 hover:opacity-100 transition-opacity duration-500">
                     {/* Simple Logo Placeholders matching the clean style */}
                     {['Google', 'NHL', 'Tinder', 'Badoo', 'Disney', 'Yahoo'].map((logo) => (
                        <span key={logo} className="text-lg font-bold text-slate-400 font-serif italic">{logo}</span>
                     ))}
                </motion.div>
            </div>

            
        </motion.div>
      </main>

      {/* Features Bento Grid */}
      <section id="features" className="py-32 relative">
         <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Everything you need to hire better.
            </h2>
            <p className="text-slate-500 text-lg">
              Replace your tedious screening calls with an efficient, modular workflow designed for modern teams.
            </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Feature 1: Async Video */}
                <motion.div 
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative"
                >
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Video className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Async Video</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Candidates record answers on their own time. You review them when it suits you. No more scheduling conflicts.
                    </p>
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
                </motion.div>

                {/* Feature 2: Smart Analytics */}
                <motion.div 
                    whileHover={{ y: -8 }}
                    className="group bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative text-white"
                >
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Anti-Bias Engine</h3>
                    <p className="text-slate-300 leading-relaxed">
                        Our AI analyzes responses for concrete skills and confidence, removing unconscious bias from the screening process.
                    </p>
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                </motion.div>

                {/* Feature 3: Fair & Secure */}
                <motion.div 
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Shield className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Fair & Secure</h3>
                    <p className="text-slate-500 leading-relaxed">
                        Standardized questions, strict time limits, and anti-cheating measures ensure every candidate gets a fair shot.
                    </p>
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out" />
                </motion.div>
            </div>
         </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 bg-white relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How Oslin AI fits into your hiring flow.
            </h2>
            <p className="text-slate-500 text-lg">
              Go from job description to short‑listed candidates in days, not weeks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs">
                  1
                </span>
                Create your job profile
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Define the role, seniority, and skills you care about. Oslin suggests role‑specific video questions in seconds.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs">
                  2
                </span>
                Invite candidates
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share a single interview link with all applicants. They complete a guided, timed video interview on their own schedule.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs">
                  3
                </span>
                Review & decide
                      </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Watch responses at 1.5x speed, skim AI‑generated highlights, and move top performers straight into live interviews.
              </p>
                      </div>
                    </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <p>
                Built for recruiting teams hiring{" "}
                <span className="font-semibold text-slate-700">across multiple roles and locations.</span>
              </p>
                  </div>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>No installation required – works in any modern browser.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute -left-40 top-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-40 bottom-0 w-72 h-72 rounded-full bg-indigo-500/30 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple pricing for modern hiring teams.
            </h2>
            <p className="text-slate-300 text-lg">
              Start free, then scale as your hiring pipeline grows. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">Starter</h3>
              <p className="text-sm text-slate-400 mb-4">For founders and small teams hiring a few roles.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-sm text-slate-400 ml-1">/month</span>
                  </div>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  1 active job profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  25 video interviews / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Core AI scoring & highlights
                    </li>
                </ul>
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                  <Button className="w-full rounded-full bg-white text-slate-900 hover:bg-slate-100">
                    Get Started
                    </Button>
                  </DialogTrigger>
                </Dialog>
          </div>

            {/* Growth */}
            <div className="rounded-2xl border border-primary/60 bg-slate-900 p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                Most popular
          </div>
              <h3 className="text-lg font-semibold text-white mb-2">Growth</h3>
              <p className="text-sm text-slate-400 mb-4">For teams running continuous hiring cycles.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$79</span>
                <span className="text-sm text-slate-400 ml-1">/month</span>
        </div>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Up to 5 active job profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  250 video interviews / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Advanced analytics & team collaboration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Priority email support
                </li>
              </ul>
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                  <Button className="w-full rounded-full shadow-lg shadow-primary/40">
                    Start 14‑day Trial
                    </Button>
                  </DialogTrigger>
                </Dialog>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-sm text-slate-400 mb-4">For distributed teams with complex hiring needs.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">Let&apos;s talk</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Unlimited job profiles & interviews
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Custom security & compliance review
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Dedicated CSM & onboarding
                </li>
              </ul>
              <Button variant="outline" className="w-full rounded-full border-slate-700 text-slate-100 hover:bg-slate-800">
                Talk to sales
              </Button>
            </div>
          </div>

          <div className="mt-10 text-center text-xs md:text-sm text-slate-400">
            No credit card required for the free plan. Upgrade only when you&apos;re ready.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">Oslin AI</span>
              </div>
            <div className="text-slate-500 text-sm font-medium">
              © 2024 Oslin AI. All rights reserved.
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-500">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
