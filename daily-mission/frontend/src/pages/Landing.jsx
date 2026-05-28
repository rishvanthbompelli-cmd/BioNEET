import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Rocket, Target, Zap, LayoutDashboard, Database, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

const FeatureCard = ({ icon: Icon, title, description, colorClass }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity ${colorClass}`}></div>
    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 w-fit ${colorClass.replace('bg-', 'text-')}`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white mt-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 relative pt-20 pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-300">New: AI Study Planner is live!</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Crack EAPCET & NEET with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
              AI-Powered Precision
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing your preparation. Get personalized daily missions, smart AI quizzes, interactive diagrams, and analytics that guarantee your rank.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 glow-effect">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
        
        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900 pointer-events-none z-10" />
          <div className="glass-card p-2 border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-accent-500/10 opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-xl opacity-60 mix-blend-screen"
            />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 bg-dark-800/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built specifically for BiPC students targeting top ranks in AP/TS EAPCET and NEET.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={BrainCircuit}
              title="Smart AI Planner"
              description="Input your weak subjects, daily hours, and target rank. Our AI generates a personalized daily schedule."
              colorClass="bg-purple-500"
            />
            <FeatureCard 
              icon={Target}
              title="Adaptive Quizzes"
              description="AI-generated MCQs, assertion-reasoning, and match-the-following questions based on your performance."
              colorClass="bg-blue-500"
            />
            <FeatureCard 
              icon={Zap}
              title="Short Notes & Formulas"
              description="High-yield chapter summaries, memory tricks, and formula sheets optimized for rapid revision."
              colorClass="bg-orange-500"
            />
            <FeatureCard 
              icon={LayoutDashboard}
              title="Analytics Dashboard"
              description="Track accuracy, mock scores, study time, and get AI suggestions on where to focus next."
              colorClass="bg-green-500"
            />
            <FeatureCard 
              icon={Database}
              title="Important Diagrams Hub"
              description="Interactive zoomable diagrams for Biology with labels and revision modes."
              colorClass="bg-pink-500"
            />
            <FeatureCard 
              icon={Rocket}
              title="Mock Tests"
              description="Full syllabus and chapter-wise tests simulating the real NEET/EAPCET exam environment."
              colorClass="bg-accent-500"
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 mt-auto bg-dark-900">
        <p>&copy; {new Date().getFullYear()} Daily Mission. All rights reserved.</p>
      </footer>
    </div>
  );
}
