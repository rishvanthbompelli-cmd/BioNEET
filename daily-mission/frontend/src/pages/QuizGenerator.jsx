import React, { useEffect, useState } from 'react';
import { Wand2, CheckCircle2 } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { aiApi, contentApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const QUIZ_TYPES = [
  { id: 'chapter', label: 'Chapter Quiz', desc: '5 questions on a specific chapter' },
  { id: 'subject', label: 'Full Subject', desc: '10 questions covering entire subject' },
  { id: 'neet_full', label: 'Full NEET Paper', desc: '15 mixed NEET BiPC questions' },
  { id: 'eapcet_full', label: 'Full EAPCET Paper', desc: '15 rapid-fire EAPCET questions' },
];

export default function QuizGenerator() {
  const { user } = useAuthStore();
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState({
    quizType: 'chapter',
    year: 'INTER_1',
    subject: 'Botany',
    chapter: '',
    topic: '',
    examMode: user?.examMode || 'NEET',
  });
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    contentApi.getChapters({ year: form.year, subject: form.subject })
      .then((res) => setChapters(res.data))
      .catch(console.error);
  }, [form.year, form.subject]);

  const filteredChapters = chapters;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRevealed({});
    setQuestions(null);
    try {
      const res = await aiApi.generateQuiz(form);
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate quiz. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const needsChapter = form.quizType === 'chapter';
  const needsSubject = ['chapter', 'subject'].includes(form.quizType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="AI Quiz Generator" subtitle="Powered by Groq AI — chapter, subject, NEET & EAPCET full papers" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUIZ_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setForm({ ...form, quizType: t.id })}
            className={`p-4 rounded-xl text-left border transition-colors ${form.quizType === t.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
          >
            <div className="text-sm font-semibold text-white mb-1">{t.label}</div>
            <div className="text-xs text-slate-500">{t.desc}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl space-y-4">
        {!['neet_full', 'eapcet_full'].includes(form.quizType) && (
          <div className="flex gap-2">
            {[
              { id: 'INTER_1', label: 'Inter 1st Year' },
              { id: 'INTER_2', label: 'Inter 2nd Year' },
            ].map((y) => (
              <button key={y.id} type="button" onClick={() => setForm({ ...form, year: y.id, chapter: '' })} className={`px-4 py-2 rounded-xl text-sm ${form.year === y.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}>{y.label}</button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {needsSubject && (
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Subject</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, chapter: '' })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
              {['Botany', 'Zoology', 'Physics', 'Chemistry'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        {needsChapter && (
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Chapter *</label>
            <select required value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200">
              <option value="">Select chapter</option>
              {filteredChapters.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.weightageLevel?.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
        {needsChapter && (
          <div className="md:col-span-2">
            <label className="text-sm text-slate-400 mb-1 block">Topic (optional)</label>
            <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Photosynthesis" className="w-full bg-dark-900/50 border border-white/10 rounded-xl py-2.5 px-4 text-slate-200" />
          </div>
        )}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-accent-500 hover:bg-accent-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          <Wand2 size={20} /> {loading ? 'Generating with Groq AI...' : 'Generate Quiz'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      {loading && <LoadingState message="Groq AI is generating questions..." />}

      {questions && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{questions.length} questions generated</p>
          {questions.map((q, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-2 text-xs mb-2">
                <span className="text-accent-400 font-semibold">{q.type || 'MCQ'}</span>
                {q.subject && <span className="text-slate-500">· {q.subject}</span>}
              </div>
              <p className="text-slate-200 mb-4">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {Object.entries(q.options || {}).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setRevealed({ ...revealed, [i]: k })} className={`p-3 rounded-xl text-left text-sm border ${revealed[i] === k ? (k === q.correctOption ? 'border-green-500 bg-green-500/10 text-green-300' : 'border-red-500 bg-red-500/10 text-red-300') : 'border-white/10 bg-white/5 text-slate-300'}`}>
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
