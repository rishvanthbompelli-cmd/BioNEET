import React, { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { contentApi } from '../lib/api';

export default function Formulas() {
  const [formulas, setFormulas] = useState([]);
  const [subject, setSubject] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getFormulas({ subject: subject !== 'All' ? subject : undefined })
      .then((res) => setFormulas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [subject]);

  return (
    <div className="space-y-6">
      <PageHeader title="Formula & Reactions Hub" subtitle="Physics formulas, chemistry reactions, shortcuts & constants" />
      <div className="flex gap-2 overflow-x-auto custom-scrollbar">
        {['All', 'Physics', 'Chemistry'].map((s) => (
          <button key={s} onClick={() => setSubject(s)} className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap ${subject === s ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400'}`}>{s}</button>
        ))}
      </div>
      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.map((f) => (
            <div key={f.id} className="glass-card p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400"><FlaskConical size={20} /></div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{f.subject} · {f.category}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{f.content}</pre>
                  {f.shortcut && <p className="text-xs text-accent-400 mt-2">💡 {f.shortcut}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
