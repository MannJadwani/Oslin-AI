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
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
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
      <main className="relative z-10 pt-28 md:pt-36 pb-0 container mx-auto px-4">
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center max-w-6xl mx-auto"
        >
            {/* Hero Top: Typography & Buttons */}
            <div className="max-w-3xl mx-auto mb-8">
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6 mx-auto">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Hiring Engine v2.0</span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-5">
                    Accelerate Hiring At <br/>
                    <span className="inline-flex items-center gap-3 align-middle">
                        Your Company
                        <div className="relative inline-flex h-8 md:h-10 w-14 md:w-16 rounded-full bg-blue-100 border border-blue-200 items-center px-1 justify-end cursor-pointer">
                            <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-blue-600 shadow-sm" />
                        </div>
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-2xl mx-auto">
                    Oslin's modular AI platform takes the heavy lifting out of screening. 
                    Start securely getting top talent into interviews today.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                     <Button variant="outline" size="lg" className="h-12 md:h-14 px-6 md:px-8 rounded-full text-base font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                        Book a demo
                    </Button>
                    
                    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 rounded-full text-base font-semibold bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(37,99,235,0.5),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:-translate-y-0.5 transition-all duration-300 border border-blue-700">
                                Integrate now <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                    </Dialog>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 md:gap-8 grayscale opacity-50 hover:opacity-80 transition-opacity duration-500">
                     {/* Simple Logo Placeholders matching the clean style */}
                     {['Google', 'NHL', 'Tinder', 'Badoo', 'Disney', 'Yahoo'].map((logo) => (
                        <span key={logo} className="text-base md:text-lg font-bold text-slate-400 font-serif italic">{logo}</span>
                     ))}
                </motion.div>
            </div>

            {/* Hero Visual: Platform Preview - Overlapping into next section */}
            <motion.div 
                variants={itemVariants}
                className="relative w-full max-w-6xl mx-auto -mb-32 md:-mb-48 px-4"
            >
                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-100/60 to-indigo-100/60 rounded-full blur-3xl -z-10" />
                
                {/* Main Layout Grid */}
                <div className="relative grid grid-cols-3 gap-4 md:gap-8 items-center min-h-[400px] md:min-h-[450px]">
                    
                    {/* LEFT COLUMN - Cards & Icons */}
                    <div className="flex flex-col items-end gap-4 md:gap-6">
                        {/* Top Left Card - Video Interview */}
                        <motion.div 
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white rounded-2xl p-3 md:p-4 shadow-xl border border-slate-100 w-full max-w-[200px] md:max-w-[240px]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white ml-0.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs md:text-sm font-bold text-slate-900 truncate">Video Response</div>
                                    <div className="text-[10px] md:text-xs text-slate-500">01:24 / 02:00</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Left Icons Row */}
                        <div className="flex gap-2 md:gap-3">
                            <motion.div 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" fill="#4A154B"/>
                                </svg>
                            </motion.div>
                            <motion.div 
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                                    <path fill="#0078D4" d="M11.5 3v8.5H3V3h8.5zm0 18H3v-8.5h8.5V21zm1-18H21v8.5h-8.5V3zm8.5 9.5V21h-8.5v-8.5H21z"/>
                                </svg>
                            </motion.div>
                        </div>

                        {/* Bottom Left Card - Screening */}
                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="bg-white rounded-2xl p-3 md:p-4 shadow-xl border border-slate-100 w-full max-w-[200px] md:max-w-[240px]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Screening Queue</span>
                            </div>
                            <div className="flex -space-x-2">
                                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop&crop=face" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                                <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+8</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* CENTER COLUMN - Main Hub */}
                    <div className="flex justify-center">
                        <motion.div 
                            animate={{ 
                                boxShadow: [
                                    "0 0 0 0 rgba(59, 130, 246, 0)",
                                    "0 0 0 30px rgba(59, 130, 246, 0.03)",
                                    "0 0 0 0 rgba(59, 130, 246, 0)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-b from-white to-slate-50 rounded-full border border-slate-200 shadow-2xl flex flex-col items-center justify-center z-20"
                        >
                            {/* Outer ring decoration */}
                            <div className="absolute inset-[-20px] md:inset-[-30px] border border-dashed border-slate-200 rounded-full" />
                            
                            <div className="flex -space-x-3 mb-2 md:mb-3">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" alt="" className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white object-cover shadow-md" />
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="" className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white object-cover shadow-md" />
                                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="" className="w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white object-cover shadow-md" />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-slate-900 text-sm md:text-base">Candidates</div>
                                <div className="text-[10px] md:text-xs text-slate-500">AI Filtered</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN - Cards & Icons */}
                    <div className="flex flex-col items-start gap-4 md:gap-6">
                        {/* Top Right Card - AI Analysis */}
                        <motion.div 
                            animate={floatingAnimation}
                            className="bg-white rounded-2xl p-3 md:p-4 shadow-xl border border-slate-100 w-full max-w-[200px] md:max-w-[260px]"
                        >
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] md:text-xs font-medium text-slate-500">Agent Analysis</div>
                                    <div className="text-xs md:text-sm font-bold text-slate-900">Smart AI Agent</div>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2 md:p-3 border border-slate-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden flex-shrink-0">
                                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face" alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-700">Match Found</span>
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed">98% skill alignment detected.</p>
                            </div>
                        </motion.div>

                        {/* Right Icons Row */}
                        <div className="flex gap-2 md:gap-3">
                            <motion.div 
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                                    <path fill="#FF6C37" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                </svg>
                            </motion.div>
                            <motion.div 
                                animate={{ y: [0, -9, 0] }}
                                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24">
                                    <path fill="#1DA1F2" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                </svg>
                            </motion.div>
                        </div>

                        {/* Bottom Right Card - Score */}
                        <motion.div 
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                            className="bg-white rounded-2xl p-3 md:p-4 shadow-xl border border-slate-100 w-full max-w-[200px] md:max-w-[240px]"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-slate-700">Interview Score</span>
                                <span className="text-xs font-bold text-emerald-600">92%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "92%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" 
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Connecting Lines (SVG) - Updated for new layout */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 hidden md:block" viewBox="0 0 1000 450" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#e2e8f0" />
                            <stop offset="50%" stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>
                    </defs>
                    {/* Left curves to center */}
                    <path d="M 280 120 Q 380 150 420 225" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                    <path d="M 280 330 Q 380 300 420 225" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                    {/* Right curves to center */}
                    <path d="M 720 120 Q 620 150 580 225" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                    <path d="M 720 330 Q 620 300 580 225" fill="none" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                </svg>
            </motion.div>
        </motion.div>
      </main>

      {/* Features Bento Grid */}
      <section id="features" className="pt-48 md:pt-64 pb-32 relative">
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
