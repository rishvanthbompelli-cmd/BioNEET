import React, { useEffect, useState } from 'react';
import { Download, Eye, FileText } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { papersApi } from '../lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PreviousPapers() {
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ states: [], years: [], subjects: [] });
  const [state, setState] = useState('All');
  const [year, setYear] = useState('All');
  const [subject, setSubject] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    papersApi.getFilters().then((res) => setFilters(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    papersApi.getAll({
      state: state !== 'All' ? state : undefined,
      year: year !== 'All' ? year : undefined,
      subject: subject !== 'All' ? subject : undefined,
    })
      .then((res) => setPapers(res.data))
      .catch((err) => {
        setError(err.code === 'ERR_NETWORK' ? 'Backend not reachable.' : 'Failed to load papers.');
      })
      .finally(() => setLoading(false));
  }, [state, year, subject]);

  const grouped = papers.reduce((acc, p) => {
    const key = `${p.state} EAPCET — ${p.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const fileBase = (url) => `${API_URL}${url}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Previous EAPCET Papers" subtitle="AP & TS BiPC question papers — view & download PDFs" />

      <div className="flex flex-wrap gap-2">
        <select value={state} onChange={(e) => setState(e.target.value)} className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2 text-slate-200 text-sm">
          <option value="All">All States</option>
          {filters.states.map((s) => <option key={s} value={s}>{s === 'AP' ? 'AP EAPCET' : 'TS EAPCET'}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2 text-slate-200 text-sm">
          <option value="All">All Years</option>
          {filters.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2 text-slate-200 text-sm">
          <option value="All">All Subjects</option>
          {filters.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {loading ? <LoadingState /> : papers.length === 0 ? (
        <p className="text-slate-500 text-center py-12">No papers found. Run seed to import EAPCET papers.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText size={18} className="text-primary-400" />
                {group}
              </h3>
              <div className="space-y-2">
                {items.map((p) => (
                  <div key={p.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-medium">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {p.state} · {p.year} · {p.subject}{p.shift ? ` · ${p.shift}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={fileBase(p.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-sm hover:bg-primary-500/30">
                        <Eye size={16} /> View
                      </a>
                      <a href={fileBase(p.fileUrl)} download className="flex items-center gap-1 px-3 py-1.5 bg-accent-500/20 text-accent-400 rounded-lg text-sm hover:bg-accent-500/30">
                        <Download size={16} /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
