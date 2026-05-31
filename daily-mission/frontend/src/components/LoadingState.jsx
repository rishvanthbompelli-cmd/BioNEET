import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="animate-spin text-primary-400" size={32} />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default LoadingState;
