import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Play, Shield, Zap, Brain, BarChart3, Users, Video } from "lucide-react";
import { useState } from "react";
import { SignInForm } from "../SignInForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface LandingPageProps {
  onGetStarted: () => void;
}

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
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="min-h-screen font-sans text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Oslin</span>
            <span className="text-slate-400"> AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full px-6">Get Started</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <SignInForm />
                </div>
            </DialogContent>
        </Dialog>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-50 overflow-hidden">
        {/* Dot Grid Background */}
        <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-6 inline-block rounded-full bg-white border border-slate-200 px-4 py-1.5 shadow-sm">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                New: Anti-Cheating Mode 2.0
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              The Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Video Interviewing</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automate your screening process with AI-powered video interviews. 
              Get deep insights into soft skills and technical capabilities instantly.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            Start Hiring Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                </Dialog>
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg bg-white hover:bg-slate-50">
                    View Demo
                </Button>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl pointer-events-none hidden lg:block">
             {/* Card 1: AI Analysis */}
             <motion.div 
                animate={floatingAnimation}
                className="absolute top-20 left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-64"
             >
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">AI Analysis</div>
                        <div className="text-xs text-slate-500">Processing answer...</div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[85%]"></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Confidence</span>
                        <span>85%</span>
                    </div>
                </div>
             </motion.div>

             {/* Card 2: Candidate Score */}
             <motion.div 
                animate={floatingAnimation}
                transition={{ delay: 1 }}
                className="absolute bottom-40 right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-56"
             >
                 <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+12%</span>
                 </div>
                 <div className="text-3xl font-bold text-slate-900 mb-1">98/100</div>
                 <div className="text-sm text-slate-500">Top Candidate Score</div>
             </motion.div>

             {/* Card 3: Security */}
             <motion.div 
                animate={floatingAnimation}
                transition={{ delay: 0.5 }}
                className="absolute top-40 right-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-48"
             >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Shield className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">Anti-Cheat</div>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                        </div>
                    </div>
                </div>
             </motion.div>
             
             {/* Card 4: Video */}
             <motion.div 
                animate={floatingAnimation}
                transition={{ delay: 1.5 }}
                className="absolute bottom-20 left-20 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 w-auto"
             >
                 <div className="relative w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
                    <Video className="w-6 h-6 text-white relative z-10" />
                 </div>
                 <div className="pr-2">
                    <div className="font-bold text-slate-900">HD Recording</div>
                    <div className="text-xs text-slate-500">Crystal clear audio</div>
                 </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid (Dark Section) */}
      <section id="features" className="bg-slate-950 py-24 relative overflow-hidden">
         {/* Dot Grid Background Dark */}
         <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to hire better</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Replace your tedious screening calls with an efficient, AI-driven workflow.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 overflow-hidden relative group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <Play className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Asynchronous Video</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Candidates record answers on their own time. You review them when it suits you. No more scheduling conflicts.
                    </p>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 overflow-hidden relative group"
                >
                     <div className="absolute top-0 right-0 p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-24 h-24 bg-purple-500/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="bg-purple-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Smart Analytics</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Our AI analyzes responses for confidence, clarity, and keywords, giving you a scored summary for every candidate.
                    </p>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 overflow-hidden relative group"
                >
                     <div className="absolute top-0 right-0 p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Fair & Secure</h3>
                    <p className="text-slate-400 leading-relaxed">
                        Standardized questions and time limits ensure every candidate gets a fair shot. Anti-cheating measures keep it honest.
                    </p>
                </motion.div>
            </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Zap className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold text-slate-900">Oslin AI</span>
            </div>
            <div className="text-slate-500 text-sm">
                © 2024 Oslin AI. All rights reserved.
            </div>
            <div className="flex gap-6 text-slate-600">
                <a href="#" className="hover:text-primary">Privacy</a>
                <a href="#" className="hover:text-primary">Terms</a>
                <a href="#" className="hover:text-primary">Contact</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

