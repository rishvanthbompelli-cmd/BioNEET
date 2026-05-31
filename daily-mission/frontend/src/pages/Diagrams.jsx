import React, { useEffect, useState } from 'react';
import { ZoomIn, Download } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { contentApi } from '../lib/api';

export default function Diagrams() {
  const [diagrams, setDiagrams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.getDiagrams().then((res) => setDiagrams(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <button onClick={() => setSelected(null)} className="text-primary-400 text-sm">← Back</button>
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-xs text-primary-400">{selected.subject} · {selected.category}</div>
              <h1 className="text-2xl font-bold text-white">{selected.title}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLabels(!showLabels)} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-slate-300">{showLabels ? 'Hide' : 'Show'} Labels</button>
              <a href={selected.imageUrl} download target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg text-slate-300"><Download size={16} /></a>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 group">
            <img src={selected.imageUrl} alt={selected.title} className="w-full transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute top-3 right-3 p-2 bg-black/50 rounded-lg"><ZoomIn size={16} className="text-white" /></div>
          </div>
          {showLabels && selected.labels?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.labels.map((l) => <span key={l} className="px-3 py-1 bg-primary-500/10 text-primary-300 rounded-lg text-sm border border-primary-500/20">{l}</span>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Important Diagrams" subtitle="Biology & physiology diagrams with labels & revision mode" />
      {loading ? <LoadingState /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diagrams.map((d) => (
            <div key={d.id} onClick={() => setSelected(d)} className="glass-card overflow-hidden cursor-pointer group hover:border-primary-500/30 transition-colors">
              <img src={d.imageUrl} alt={d.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="p-4">
                <div className="text-xs text-primary-400">{d.subject}</div>
                <h3 className="text-white font-semibold">{d.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
