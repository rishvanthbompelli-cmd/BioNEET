import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, MapPin, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function RankPredictorEAPCET() {
  const [score, setScore] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRank = (marks) => {
    if (marks > 160 || marks < 0) return null;
    
    // Approximation mapping for AP/TS EAPCET
    if (marks >= 150) return { min: 1, max: 100, colleges: ['JNTU', 'OUCE', 'CBIT', 'VNR VJIET'] };
    if (marks >= 140) return { min: 100, max: 500, colleges: ['CBIT', 'VNR VJIET', 'Vasavi', 'Gokaraju Rangaraju'] };
    if (marks >= 130) return { min: 500, max: 1500, colleges: ['Vasavi', 'Gokaraju Rangaraju', 'Narayanamma', 'MVSR'] };
    if (marks >= 120) return { min: 1500, max: 3500, colleges: ['CVR', 'KMIT', 'BVRIT', 'Vardhaman'] };
    if (marks >= 100) return { min: 4000, max: 10000, colleges: ['BVRIT', 'Vardhaman', 'Mahindra Ecole', 'Anurag'] };
    if (marks >= 80) return { min: 15000, max: 30000, colleges: ['Mallareddy', 'Geethanjali', 'SNIST', 'CMR'] };
    if (marks >= 60) return { min: 40000, max: 80000, colleges: ['Local Tier-2 Colleges', 'District Level Institutes'] };
    return { min: 90000, max: 150000, colleges: ['Private Tier-3 Colleges'] };
  };

  const handlePredict = (e) => {
    e.preventDefault();
    const marks = parseInt(score, 10);
    if (isNaN(marks) || marks < 0 || marks > 160) return;

    setIsCalculating(true);
    setPrediction(null);
    
    setTimeout(() => {
      setPrediction(calculateRank(marks));
      setIsCalculating(false);
    }, 800);
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-accent-500/20 rounded-xl">
          <GraduationCap className="w-6 h-6 text-accent-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">EAPCET Rank Predictor</h1>
          <p className="text-slate-400 text-sm mt-1">Estimate your rank and predict colleges based on marks</p>
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
                Expected Marks (out of 160)
              </label>
              <input
                type="number"
                min="0"
                max="160"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g. 120"
                className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all text-lg"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!score || isCalculating}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20"
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
              Disclaimer: Rankings vary yearly based on normalization and IPE weightage (if applicable). Use this as a general guide only.
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
                <MapPin className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Enter your marks to see predicted colleges</h3>
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
                <RefreshCw className="w-10 h-10 text-accent-500 animate-spin mb-4" />
                <p className="text-slate-400 font-medium animate-pulse">Running prediction model...</p>
              </motion.div>
            )}

            {prediction && !isCalculating && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="glass-panel rounded-2xl p-6 text-center border-accent-500/30 glow-effect relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent" />
                  <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2 relative z-10">Estimated State Rank</p>
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 relative z-10">
                    {prediction.min.toLocaleString()} - {prediction.max.toLocaleString()}
                  </h2>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary-400" />
                    Probable Colleges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {prediction.colleges.map((college, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="bg-white/5 border border-white/10 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default"
                      >
                        <MapPin className="w-3 h-3 text-accent-400" /> {college}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
