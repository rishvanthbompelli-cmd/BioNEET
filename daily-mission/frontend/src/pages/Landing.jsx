import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Rocket, Target, Zap, LayoutDashboard, Database, FileText, MessageCircle, Check, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { papersApi } from '../lib/api';

const FeatureCard = ({ icon: Icon, title, description, colorClass }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-30 transition-opacity ${colorClass}`} />
    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 w-fit ${colorClass.replace('bg-', 'text-')}`}>
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-white">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default function Landing() {
  const [paperStats, setPaperStats] = useState({ ap: 0, ts: 0, years: [] });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    papersApi.getFilters().then((res) => {
      const { states, years } = res.data;
      setPaperStats({
        ap: states.includes('AP') ? years.length : 0,
        ts: states.includes('TS') ? years.length : 0,
        years,
      });
    }).catch(() => {});
  }, []);

  const faqs = [
    { q: 'What is BioNEET?', a: 'BioNEET is an AI-powered study platform for AP & TS BiPC students preparing for NEET and EAPCET exams.' },
    { q: 'Is BioNEET free?', a: 'Yes! Create a free account to access notes, revision tracker, previous papers, AI chatbot, and more.' },
    { q: 'Which syllabus is covered?', a: 'Complete Inter 1st & 2nd year syllabus — Botany, Zoology, Physics, Chemistry (88 chapters).' },
    { q: 'How does the AI assistant work?', a: 'Our Groq-powered AI tutor answers NEET/EAPCET questions, explains concepts, and helps with study planning — securely on our server.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass-panel px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <span className="text-2xl font-bold text-gradient">BioNEET</span>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white">Login</Link>
          <Link to="/register" className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px] pointer-events-none -z-10" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500" /></span>
            <span className="text-sm text-slate-300">AI Chatbot + Previous EAPCET Papers Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Crack NEET & EAPCET with<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">BioNEET Daily Mission</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Personalized AI study plans, 88-chapter revision tracker, chapter-wise notes, previous AP/TS EAPCET papers, and an AI tutor — built for BiPC aspirants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 glow-effect">
              Start Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl">Sign In</Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Everything for BiPC Success</h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">Login to unlock all features. Your data is saved securely in PostgreSQL.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={BrainCircuit} title="AI Study Planner" description="Groq-powered daily missions tailored to your weak subjects and target rank." colorClass="bg-purple-500" />
            <FeatureCard icon={FileText} title="Chapter Notes" description="Botany, Zoology, Physics & Chemistry notes for all 88 Inter syllabus chapters." colorClass="bg-blue-500" />
            <FeatureCard icon={Target} title="AI Quiz Generator" description="Chapter, subject, NEET full & EAPCET rapid-fire quizzes generated on demand." colorClass="bg-orange-500" />
            <FeatureCard icon={Database} title="Previous EAPCET Papers" description="AP & TS EAPCET BiPC papers organized by year — view and download PDFs." colorClass="bg-green-500" />
            <FeatureCard icon={MessageCircle} title="BioNEET AI Assistant" description="Ask NEET/EAPCET questions, get concept explanations, and study guidance 24/7." colorClass="bg-pink-500" />
            <FeatureCard icon={LayoutDashboard} title="Analytics Dashboard" description="Track accuracy, mock scores, study time, and revision progress." colorClass="bg-accent-500" />
          </div>
        </div>
      </section>

      {/* Previous Papers Preview */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Previous EAPCET Papers</h2>
          <p className="text-slate-400 mb-8">AP & TS EAPCET BiPC question papers from 2020–2025. Login to view and download.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['AP EAPCET', 'TS EAPCET', '2020–2025', 'BiPC Stream'].map((label) => (
              <div key={label} className="glass-card p-4 text-center">
                <Rocket className="mx-auto text-primary-400 mb-2" size={24} />
                <div className="text-white font-semibold text-sm">{label}</div>
              </div>
            ))}
          </div>
          {paperStats.years.length > 0 && (
            <p className="text-slate-500 text-sm mb-6">Years available: {paperStats.years.join(', ')}</p>
          )}
          <Link to="/register" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-white px-6 py-3 rounded-xl font-semibold">
            Login to Access Papers <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What Students Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya S.', text: 'The revision tracker helped me cover all 88 chapters systematically. Cleared EAPCET with a great rank!' },
              { name: 'Arjun K.', text: 'AI quiz generator is amazing for last-minute NEET prep. Notes are concise and NCERT-aligned.' },
              { name: 'Sneha R.', text: 'Previous papers section saved me hours. BioNEET AI assistant explains concepts clearly.' },
            ].map((t) => (
              <div key={t.name} className="glass-card p-6">
                <p className="text-slate-300 text-sm mb-4">"{t.text}"</p>
                <div className="text-primary-400 font-semibold text-sm">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Free</h3>
              <div className="text-4xl font-extrabold text-primary-400 mb-4">₹0</div>
              <ul className="text-slate-400 text-sm space-y-2 text-left mb-6">
                {['All chapter notes', 'Revision tracker', 'Previous papers', 'AI chatbot (limited)', 'MCQs & mock tests'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check size={16} className="text-green-400" />{f}</li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold">Get Started</Link>
            </div>
            <div className="glass-card p-8 border border-primary-500/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs px-3 py-1 rounded-full">Coming Soon</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="text-4xl font-extrabold text-accent-400 mb-4">₹499<span className="text-lg text-slate-500">/mo</span></div>
              <ul className="text-slate-400 text-sm space-y-2 text-left mb-6">
                {['Unlimited AI quizzes', 'Priority AI chatbot', 'Advanced analytics', 'Personalized study plans', 'Rank prediction'].map((f) => (
                  <li key={f} className="flex items-center gap-2"><Check size={16} className="text-green-400" />{f}</li>
                ))}
              </ul>
              <button disabled className="block w-full py-3 bg-primary-500/50 text-white/70 rounded-xl font-semibold cursor-not-allowed">Notify Me</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-dark-800/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="glass-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-white font-medium">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-slate-400 text-sm">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 bg-dark-900">
        <p>&copy; {new Date().getFullYear()} BioNEET Daily Mission. Built for AP/TS BiPC students.</p>
      </footer>
    </div>
  );
}
