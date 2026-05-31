import React, { useEffect, useState } from 'react';
import { Clock, Play, Trophy } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { mockTestApi } from '../lib/api';

export default function MockTests() {
  const [tests, setTests] = useState([]);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('All');

  useEffect(() => {
    mockTestApi.getAll({ mode: mode !== 'All' ? mode : undefined })
      .then((res) => setTests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mode]);

  const startTest = async (id) => {
    setLoading(true);
    try {
      const res = await mockTestApi.getById(id);
      setActive(res.data);
      setAnswers({});
      setResult(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    const answerArr = active.questions.map((_, i) => answers[i] || '');
    try {
      const res = await mockTestApi.submit(active.id, { answers: answerArr, timeTakenMinutes: active.durationMinutes });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (active && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => setActive(null)} className="text-primary-400 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-white">{active.title}</h1>
        <div className="space-y-6">
          {active.questions.map((q, i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl">
              <div className="text-xs text-primary-400 mb-2">Q{i + 1} · {q.subject}</div>
              <p className="text-slate-200 mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(q.options).map(([k, v]) => (
                  <button key={k} onClick={() => setAnswers({ ...answers, [i]: k })} className={`p-2 rounded-lg text-sm text-left border ${answers[i] === k ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-white/10 text-slate-400'}`}>{k}. {v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={submitTest} className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold">Submit Mock Test</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <Trophy size={48} className="mx-auto text-yellow-400" />
        <h1 className="text-3xl font-bold text-white">{result.percentage}%</h1>
        <p className="text-slate-400">Score: {result.score}/{result.totalQuestions} · Percentile: {result.percentile}%</p>
        {result.weakAreas?.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl text-left">
            <h3 className="text-white font-semibold mb-2">Weak Areas</h3>
            {result.weakAreas.map((w) => <div key={w.subject} className="text-sm text-red-300">{w.subject}: {w.wrongCount} wrong</div>)}
          </div>
        )}
        <button onClick={() => { setActive(null); setResult(null); }} className="text-primary-400">Back to mock tests</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mock Tests" subtitle="NEET & EAPCET mode tests with real scoring & analytics" />
      <div className="flex gap-2">
        {['All', 'NEET', 'EAPCET'].map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-xl text-sm ${mode === m ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}>{m}</button>
        ))}
      </div>
      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((t) => (
            <div key={t.id} className="glass-card p-6 flex flex-col">
              <div className="text-xs text-primary-400 font-semibold mb-2">{t.mode}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{t.title}</h3>
              <div className="flex gap-4 text-sm text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {t.durationMinutes} min</span>
                <span>{t.totalQuestions} questions</span>
              </div>
              <button onClick={() => startTest(t.id)} className="mt-auto flex items-center justify-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 py-2.5 rounded-xl border border-primary-500/20 text-sm font-medium">
                <Play size={16} /> Start Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
