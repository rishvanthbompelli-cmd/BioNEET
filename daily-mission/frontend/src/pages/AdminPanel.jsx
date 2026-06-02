import React, { useEffect, useState } from 'react';
import { Users, FileText, Target, Shield, Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { adminApi, documentApi } from '../lib/api';

const CATEGORIES = ['Notes', 'PDF', 'Formula', 'Diagram', 'Other'];

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', category: 'Notes' });

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u, d] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        documentApi.getAll(),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setDocuments(d.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const resetForm = () => {
    setEditId(null);
    setForm({ title: '', description: '', fileUrl: '', category: 'Notes' });
    setShowForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await documentApi.update(editId, form);
      } else {
        await documentApi.create(form);
      }
      resetForm();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save document.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doc, e) => {
    e.stopPropagation();
    setEditId(doc.id);
    setForm({ title: doc.title, description: doc.description || '', fileUrl: doc.fileUrl, category: doc.category });
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document?')) return;
    try {
      await documentApi.delete(id);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  if (loading) return <LoadingState message="Loading admin panel..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Panel" subtitle="Manage platform content and users" />

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Users</h3>
        </div>
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

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Documents / PDFs</h3>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-3 py-2 rounded-xl text-sm font-medium"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="bg-dark-900/40 border border-white/10 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              required
              className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              placeholder="File URL (https://...)"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            />
            <select
              className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              className="bg-dark-900/50 border border-white/10 rounded-xl px-3 py-2 text-slate-200"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-400">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-xl">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">URL</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500">No documents yet.</td></tr>
              ) : documents.map((doc) => (
                <tr key={doc.id} className="border-b border-white/5 text-slate-300">
                  <td className="py-3">{doc.title}</td>
                  <td className="py-3"><span className="px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-300">{doc.category}</span></td>
                  <td className="py-3"><a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline break-all">{doc.fileUrl}</a></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={(e) => handleEdit(doc, e)} className="text-slate-500 hover:text-primary-400"><Pencil size={16} /></button>
                      <button onClick={(e) => handleDelete(doc.id, e)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
