import React, { useState } from 'react';
import { Wand2, CheckCircle2 } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { aiApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function QuizGenerator() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ subject: 'Botany', chapter: '', topic: '', examMode: user?.examMode || 'NEET' });
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState({});

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic) return;
    setLoading(true);
    setRevealed({});
    try {
      const res = await aiApi.generateQuiz(form);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="AI Quiz Generator" subtitle="MCQs, assertion-reason, one-word & match questions via LangChain + Ollama" />

      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Subject</label>
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
            {['Botany', 'Zoology', 'Physics', 'Chemistry'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Exam Mode</label>
          <select value={form.examMode} onChange={(e) => setForm({ ...form, examMode: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
            <option value="NEET">NEET</option>
            <option value="EAPCET">EAPCET</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Chapter (optional)</label>
          <input value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} placeholder="e.g. Plant Physiology" className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Topic *</label>
          <input required value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Photosynthesis" className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
        </div>
        <button type="submit" disabled={loading} className="md:col-span-2 bg-accent-500 hover:bg-accent-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Wand2 size={20} /> {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </form>

      {loading && <LoadingState message="AI generating questions..." />}

      {questions && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl">
              <div className="text-xs text-accent-400 font-semibold mb-2">{q.type || 'MCQ'}</div>
              <p className="text-slate-200 mb-4">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {Object.entries(q.options || {}).map(([k, v]) => (
                  <button key={k} onClick={() => setRevealed({ ...revealed, [i]: k })} className={`p-3 rounded-xl text-left text-sm border ${revealed[i] === k ? (k === q.correctOption ? 'border-green-500 bg-green-500/10 text-green-300' : 'border-red-500 bg-red-500/10 text-red-300') : 'border-white/10 bg-white/5 text-slate-300 hover:border-primary-500/30'}`}>
                    <span className="font-bold mr-2">{k}.</span>{v}
                  </button>
                ))}
              </div>
              {revealed[i] && q.explanation && (
                <div className="text-sm text-slate-400 border-t border-white/10 pt-3 flex gap-2"><CheckCircle2 size={16} className="text-green-400 shrink-0" />{q.explanation}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
