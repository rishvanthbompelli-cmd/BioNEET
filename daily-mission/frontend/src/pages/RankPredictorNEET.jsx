import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function RankPredictorNEET() {
  const [score, setScore] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRank = (marks) => {
    if (marks > 720 || marks < 0) return null;
    
    // Approximation mapping for NEET
    if (marks >= 715) return { min: 1, max: 50, category: 'Exceptional' };
    if (marks >= 700) return { min: 50, max: 300, category: 'Excellent' };
    if (marks >= 650) return { min: 2000, max: 6000, category: 'Great' };
    if (marks >= 600) return { min: 18000, max: 28000, category: 'Good' };
    if (marks >= 550) return { min: 45000, max: 60000, category: 'Average' };
    if (marks >= 500) return { min: 80000, max: 100000, category: 'Below Average' };
    if (marks >= 400) return { min: 200000, max: 280000, category: 'Needs Work' };
    if (marks >= 300) return { min: 350000, max: 480000, category: 'Needs Work' };
    return { min: 500000, max: 1000000, category: 'Needs Work' };
  };

  const getSuggestions = (category) => {
    switch (category) {
      case 'Exceptional':
      case 'Excellent':
        return ['Focus on avoiding silly mistakes.', 'Take grand mock tests regularly.', 'Revise weak concepts quickly.'];
      case 'Great':
      case 'Good':
        return ['Identify subjects where you lose marks.', 'Revise NCERT thoroughly.', 'Solve past 10 years papers.'];
      default:
        return ['Build stronger fundamental concepts.', 'Focus on Biology and Chemistry first.', 'Make concise notes for revision.'];
    }
  };

  const handlePredict = (e) => {
    e.preventDefault();
    const marks = parseInt(score, 10);
    if (isNaN(marks) || marks < 0 || marks > 720) return;

    setIsCalculating(true);
    setPrediction(null);
    
    // Fake calculation delay for smooth animation
    setTimeout(() => {
      setPrediction(calculateRank(marks));
      setIsCalculating(false);
    }, 800);
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary-500/20 rounded-xl">
          <Target className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">NEET Rank Predictor</h1>
          <p className="text-slate-400 text-sm mt-1">Estimate your All India Rank based on mock scores</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Card */}
        <motion.div 
          className="glass-panel rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handlePredict} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expected Score (out of 720)
              </label>
              <input
                type="number"
                min="0"
                max="720"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 650"
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-lg"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!score || isCalculating}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20"
            >
              {isCalculating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>Predict Rank <ChevronRight className="w-5 h-5" /></>
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200/80">
              This prediction is based on historical data. Actual ranks may vary depending on the difficulty of the paper and the number of candidates.
            </p>
          </div>
        </motion.div>

        {/* Result Area */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {!prediction && !isCalculating && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/5"
              >
                <TrendingUp className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Enter your score to see predictions</h3>
              </motion.div>
            )}

            {isCalculating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <RefreshCw className="w-10 h-10 text-primary-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Analyzing historical data...</p>
              </motion.div>
            )}

            {prediction && !isCalculating && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="glass-panel rounded-2xl p-6 text-center border-primary-500/30 glow-effect relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent" />
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2 relative z-10">Expected Rank Range</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 relative z-10">
                    {prediction.min.toLocaleString()} - {prediction.max.toLocaleString()}
                  </h2>
                  <div className="mt-4 inline-block px-4 py-1 rounded-full bg-white/10 text-sm font-medium text-slate-200 border border-white/10 relative z-10">
                    Performance: <span className="text-primary-400">{prediction.category}</span>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                    How to Improve
                  </h3>
                  <ul className="space-y-3">
                    {getSuggestions(prediction.category).map((suggestion, idx) => (
                      <motion.li 
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex items-start gap-3 text-slate-300 text-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                        {suggestion}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
