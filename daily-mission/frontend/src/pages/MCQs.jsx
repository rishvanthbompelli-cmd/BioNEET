import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';

const MOCK_MCQS = [
  {
    id: 1,
    question: "Which of the following is an example of a C4 plant?",
    options: { A: "Wheat", B: "Rice", C: "Sugarcane", D: "Potato" },
    correctOption: "C",
    explanation: "Sugarcane, Maize, and Sorghum are classic examples of C4 plants that are adapted to dry tropical regions.",
    subject: "Botany"
  }
];

export default function MCQs() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const mcq = MOCK_MCQS[0];

  const handleSelect = (key) => {
    if (showAnswer) return;
    setSelectedOption(key);
  };

  const handleSubmit = () => {
    if (selectedOption) setShowAnswer(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Practice MCQs</h1>
          <p className="text-slate-400">Master your concepts with chapter-wise questions.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Target size={18} className="text-primary-400" />
            <span className="font-semibold text-white">1/50</span>
          </div>
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Clock size={18} className="text-orange-400" />
            <span className="font-semibold text-white">45:00</span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-primary-500 w-[2%]"></div>
        </div>
        
        <div className="flex gap-3 text-sm text-primary-400 font-medium mb-4">
          <span>{mcq.subject}</span>
          <span>•</span>
          <span>Medium</span>
        </div>

        <h2 className="text-xl md:text-2xl text-slate-200 font-medium mb-8 leading-relaxed">
          {mcq.question}
        </h2>

        <div className="space-y-4 mb-8">
          {Object.entries(mcq.options).map(([key, value]) => {
            let stateClass = "border-white/10 hover:border-primary-500/50 bg-white/5 hover:bg-white/10 text-slate-300";
            let icon = null;

            if (showAnswer) {
              if (key === mcq.correctOption) {
                stateClass = "border-green-500/50 bg-green-500/10 text-green-400";
                icon = <CheckCircle2 size={20} className="text-green-500" />;
              } else if (key === selectedOption) {
                stateClass = "border-red-500/50 bg-red-500/10 text-red-400";
                icon = <XCircle size={20} className="text-red-500" />;
              } else {
                stateClass = "border-white/5 bg-white/5 text-slate-500 opacity-50";
              }
            } else if (selectedOption === key) {
              stateClass = "border-primary-500 bg-primary-500/10 text-primary-400";
            }

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={showAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${showAnswer ? '' : (selectedOption === key ? 'bg-primary-500 text-white' : 'bg-dark-900')}`}>
                    {key}
                  </div>
                  <span className="text-lg">{value}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end border-t border-white/10 pt-6 mt-6">
          {!showAnswer ? (
            <button 
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-500 hover:bg-primary-400 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 glow-effect"
            >
              Submit Answer
            </button>
          ) : (
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {showAnswer && (
        <div className="glass-panel p-6 rounded-2xl border border-green-500/20 bg-green-500/5">
          <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 size={20} /> Explanation
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {mcq.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
