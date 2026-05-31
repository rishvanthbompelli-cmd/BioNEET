import React, { useEffect, useState } from 'react';
import { Users, FileText, Target, Shield } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { adminApi } from '../lib/api';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getUsers()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading admin panel..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" subtitle="Manage platform content and users" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Users', value: stats?.users, icon: Users },
          { label: 'Notes', value: stats?.notes, icon: FileText },
          { label: 'MCQs', value: stats?.mcqs, icon: Target },
          { label: 'Mock Tests', value: stats?.mockTests, icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-5 text-center">
            <Icon className="mx-auto text-primary-400 mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-white font-semibold mb-4">Users</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 text-slate-300">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${u.role === 'ADMIN' ? 'bg-accent-500/20 text-accent-300' : 'bg-primary-500/20 text-primary-300'}`}>{u.role}</span></td>
                  <td className="py-3">{u.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
