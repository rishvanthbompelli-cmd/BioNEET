import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { mcqApi } from '../lib/api';

export default function MCQs() {
  const [mcqs, setMcqs] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('All');
  const [timer, setTimer] = useState(0);
  const subjects = ['All', 'Botany', 'Zoology', 'Physics', 'Chemistry'];

  useEffect(() => {
    setLoading(true);
    mcqApi.getAll({ subject: subject !== 'All' ? subject : undefined })
      .then((res) => { setMcqs(res.data); setIndex(0); setShowAnswer(false); setSelectedOption(null); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subject]);

  useEffect(() => {
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mcq = mcqs[index];
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!selectedOption || !mcq) return;
    try {
      const res = await mcqApi.submitAttempt(mcq.id, { selectedOption, timeSpentSec: timer });
      setResult(res.data);
      setShowAnswer(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % mcqs.length);
    setSelectedOption(null);
    setShowAnswer(false);
    setResult(null);
  };

  if (loading) return <LoadingState message="Loading MCQs..." />;
  if (!mcq) return <div className="text-slate-400 text-center py-20">No MCQs available.</div>;

  const options = { A: mcq.optionA, B: mcq.optionB, C: mcq.optionC, D: mcq.optionD };
  const correctOption = result?.correctOption || mcq.correctOption;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Practice MCQs"
        subtitle="Real questions from database — attempts tracked for analytics"
        action={
          <div className="flex gap-3">
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Target size={18} className="text-primary-400" />
              <span className="font-semibold text-white">{index + 1}/{mcqs.length}</span>
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <Clock size={18} className="text-orange-400" />
              <span className="font-semibold text-white">{formatTime(timer)}</span>
            </div>
          </div>
        }
      />

      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {subjects.map((s) => (
          <button key={s} onClick={() => setSubject(s)} className={`px-3 py-1.5 rounded-lg text-sm ${subject === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}>{s}</button>
        ))}
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
          <div className="h-full bg-primary-500 transition-all" style={{ width: `${((index + 1) / mcqs.length) * 100}%` }} />
        </div>
        <div className="flex gap-3 text-sm text-primary-400 font-medium mb-4">
          <span>{mcq.subject}</span><span>•</span><span>{mcq.difficulty}</span>
          {mcq.chapter && <><span>•</span><span>{mcq.chapter.name}</span></>}
        </div>
        <h2 className="text-xl md:text-2xl text-slate-200 font-medium mb-8 leading-relaxed">{mcq.question}</h2>
        <div className="space-y-3 mb-8">
          {Object.entries(options).map(([key, value]) => {
            let stateClass = 'border-white/10 hover:border-primary-500/50 bg-white/5 text-slate-300';
            let icon = null;
            if (showAnswer) {
              if (key === correctOption) {
                stateClass = 'border-green-500/50 bg-green-500/10 text-green-400';
                icon = <CheckCircle2 size={20} className="text-green-500" />;
              } else if (key === selectedOption) {
                stateClass = 'border-red-500/50 bg-red-500/10 text-red-400';
                icon = <XCircle size={20} className="text-red-500" />;
              } else stateClass = 'border-white/5 bg-white/5 text-slate-500 opacity-50';
            } else if (selectedOption === key) {
              stateClass = 'border-primary-500 bg-primary-500/10 text-primary-400';
            }
            return (
              <button key={key} onClick={() => !showAnswer && setSelectedOption(key)} disabled={showAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${selectedOption === key && !showAnswer ? 'bg-primary-500 text-white' : 'bg-dark-900'}`}>{key}</div>
                  <span>{value}</span>
                </div>
                {icon}
              </button>
            );
          })}
        </div>
        <div className="flex justify-end border-t border-white/10 pt-6">
          {!showAnswer ? (
            <button onClick={handleSubmit} disabled={!selectedOption} className="bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold">Submit Answer</button>
          ) : (
            <button onClick={handleNext} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
      {showAnswer && (result?.explanation || mcq.explanation) && (
        <div className="glass-panel p-6 rounded-2xl border border-green-500/20 bg-green-500/5">
          <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2"><CheckCircle2 size={20} /> Explanation</h3>
          <p className="text-slate-300">{result?.explanation || mcq.explanation}</p>
        </div>
      )}
    </div>
  );
}
