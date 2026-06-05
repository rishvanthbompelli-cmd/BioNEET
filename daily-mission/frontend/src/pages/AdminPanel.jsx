import React, { useEffect, useState } from 'react';
import { Users, FileText, Shield, Plus, BookOpen, Trash2, AlertCircle, LayoutDashboard } from 'lucide-react';
import { PageHeader, LoadingState } from '../components/LoadingState';
import { adminApi, notesApi, papersApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

const SUBJECTS = ['Botany', 'Zoology', 'Physics', 'Chemistry'];

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState({ open: false, type: '', id: null, label: '' });

  // Upload Forms State
  const [noteForm, setNoteForm] = useState({ title: '', content: '', subject: 'Botany', highlights: '' });
  const [paperForm, setPaperForm] = useState({ title: '', fileUrl: '', state: 'AP', year: new Date().getFullYear(), subject: 'BiPC', shift: '' });
  const [mockForm, setMockForm] = useState({ title: '', durationMinutes: 180, totalQuestions: 160, instructions: '', fileUrl: '' });
  const [formulaForm, setFormulaForm] = useState({ chapter: '', subject: 'Physics', expression: '', description: '' });
  const [diagramForm, setDiagramForm] = useState({ title: '', category: 'General', imageUrl: '', labels: '' });
  const [handbookForm, setHandbookForm] = useState({ title: '', subject: 'Botany', fileUrl: '' });

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, notesRes, papersRes] = await Promise.all([
        adminApi.getDashboardStats(),
        notesApi.getAll({ isShared: true }),
        papersApi.getAll()
      ]);
      setStats(statsRes.data);
      setNotes(notesRes.data?.notes || notesRes.data || []);
      setPapers(papersRes.data?.papers || papersRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async () => {
    try {
      if (deleteModal.type === 'user') await adminApi.deleteUser(deleteModal.id);
      if (deleteModal.type === 'note') await adminApi.deleteNote(deleteModal.id);
      if (deleteModal.type === 'paper') await adminApi.deletePaper(deleteModal.id);
      setSuccess(`${deleteModal.type} deleted successfully`);
      setDeleteModal({ open: false, type: '', id: null, label: '' });
      loadData();
    } catch (err) {
      setError(`Failed to delete ${deleteModal.type}`);
    }
  };

  const handleUpload = async (e, type) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      if (type === 'note') await adminApi.createNote(noteForm);
      if (type === 'paper') await adminApi.createPaper(paperForm);
      if (type === 'mock') await adminApi.createMockTest(mockForm);
      if (type === 'formula') await adminApi.createFormula(formulaForm);
      if (type === 'diagram') await adminApi.createDiagram(diagramForm);
      if (type === 'handbook') await adminApi.createHandbook(handbookForm);
      
      setSuccess(`${type} uploaded successfully!`);
      // Reset forms
      if (type === 'note') setNoteForm({ title: '', content: '', subject: 'Botany', highlights: '' });
      if (type === 'paper') setPaperForm({ title: '', fileUrl: '', state: 'AP', year: new Date().getFullYear(), subject: 'BiPC', shift: '' });
      if (type === 'mock') setMockForm({ title: '', durationMinutes: 180, totalQuestions: 160, instructions: '', fileUrl: '' });
      if (type === 'formula') setFormulaForm({ chapter: '', subject: 'Physics', expression: '', description: '' });
      if (type === 'diagram') setDiagramForm({ title: '', category: 'General', imageUrl: '', labels: '' });
      if (type === 'handbook') setHandbookForm({ title: '', subject: 'Botany', fileUrl: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to upload ${type}.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading admin panel..." />;

  return (
    <div className="space-y-6 relative">
      <PageHeader
        title="Admin Panel"
        subtitle={`Logged in as ${user.email} — full platform control`}
        action={
          <div className="flex items-center gap-2 bg-accent-500/10 border border-accent-500/20 px-4 py-2 rounded-xl">
            <Shield className="text-accent-400" size={18} />
            <span className="text-accent-300 text-sm font-semibold">Admin</span>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-800 border border-red-500/30 p-6 rounded-2xl w-full max-w-md">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
            </div>
            <p className="text-slate-300 mb-6">Are you sure you want to delete {deleteModal.label}? This action is irreversible.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ open: false, type: '', id: null, label: '' })} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl transition-colors">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3">{error}</p>}
      {success && <p className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-xl py-3">{success}</p>}

      {/* Tabs */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2">
        {['dashboard', 'users', 'notes', 'papers', 'uploads'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium text-sm transition-all ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 text-center">
            <Users className="mx-auto text-primary-400 mb-2" size={28} />
            <div className="text-3xl font-bold text-white">{stats?.totalUsers ?? 0}</div>
            <div className="text-sm text-slate-400 mt-1">Total Users</div>
          </div>
          <div className="glass-card p-6 text-center">
            <BookOpen className="mx-auto text-blue-400 mb-2" size={28} />
            <div className="text-3xl font-bold text-white">{stats?.notesCount ?? 0}</div>
            <div className="text-sm text-slate-400 mt-1">Shared Notes</div>
          </div>
          <div className="glass-card p-6 text-center">
            <FileText className="mx-auto text-green-400 mb-2" size={28} />
            <div className="text-3xl font-bold text-white">{stats?.papersCount ?? 0}</div>
            <div className="text-sm text-slate-400 mt-1">Previous Papers</div>
          </div>
          <div className="glass-card p-6 text-center">
            <LayoutDashboard className="mx-auto text-accent-400 mb-2" size={28} />
            <div className="text-xl font-bold text-white mt-3">Overview</div>
            <div className="text-sm text-slate-400 mt-1">All Systems Active</div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={18} className="text-primary-400" />
            Registered Users
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Joined Date</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.users || []).map((u) => (
                  <tr key={u.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                    <td className="py-3 px-2">{u.name}</td>
                    <td className="py-3 px-2">{u.email}</td>
                    <td className="py-3 px-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => setDeleteModal({ open: true, type: 'user', id: u.id, label: u.email })} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            Shared Notes Management
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-3 px-2">Title</th>
                  <th className="text-left py-3 px-2">Subject</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                  <tr key={n.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                    <td className="py-3 px-2 truncate max-w-xs">{n.title}</td>
                    <td className="py-3 px-2">{n.subject}</td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => setDeleteModal({ open: true, type: 'note', id: n.id, label: `Note: ${n.title}` })} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-green-400" />
            Exam Papers Management
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="text-left py-3 px-2">Title</th>
                  <th className="text-left py-3 px-2">Year</th>
                  <th className="text-right py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                    <td className="py-3 px-2">{p.title}</td>
                    <td className="py-3 px-2">{p.year}</td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => setDeleteModal({ open: true, type: 'paper', id: p.id, label: `Paper: ${p.title}` })} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'uploads' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-primary-400" />
              Upload Note
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'note')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Title" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} />
              <select className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" value={noteForm.subject} onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea required rows={4} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Content" value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} />
              <button type="submit" disabled={saving} className="w-full bg-primary-500 hover:bg-primary-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Note</button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-green-400" />
              Upload Paper
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'paper')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Title" value={paperForm.title} onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })} />
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="File URL" value={paperForm.fileUrl} onChange={(e) => setPaperForm({ ...paperForm, fileUrl: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Year" value={paperForm.year} onChange={(e) => setPaperForm({ ...paperForm, year: e.target.value })} />
                <select className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" value={paperForm.state} onChange={(e) => setPaperForm({ ...paperForm, state: e.target.value })}>
                  <option value="AP">AP</option>
                  <option value="TS">TS</option>
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-accent-500 hover:bg-accent-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Paper</button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-purple-400" />
              Upload Mock Test
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'mock')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Title" value={mockForm.title} onChange={(e) => setMockForm({ ...mockForm, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Duration (min)" value={mockForm.durationMinutes} onChange={(e) => setMockForm({ ...mockForm, durationMinutes: e.target.value })} />
                <input required type="number" className="bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Questions Count" value={mockForm.totalQuestions} onChange={(e) => setMockForm({ ...mockForm, totalQuestions: e.target.value })} />
              </div>
              <input className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Instructions (optional)" value={mockForm.instructions} onChange={(e) => setMockForm({ ...mockForm, instructions: e.target.value })} />
              <input className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="File URL (optional)" value={mockForm.fileUrl} onChange={(e) => setMockForm({ ...mockForm, fileUrl: e.target.value })} />
              <button type="submit" disabled={saving} className="w-full bg-purple-500 hover:bg-purple-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Mock Test</button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-pink-400" />
              Upload Formula
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'formula')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Expression (e.g. F = ma)" value={formulaForm.expression} onChange={(e) => setFormulaForm({ ...formulaForm, expression: e.target.value })} />
              <select className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" value={formulaForm.subject} onChange={(e) => setFormulaForm({ ...formulaForm, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Chapter (optional)" value={formulaForm.chapter} onChange={(e) => setFormulaForm({ ...formulaForm, chapter: e.target.value })} />
              <textarea rows={2} className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Description" value={formulaForm.description} onChange={(e) => setFormulaForm({ ...formulaForm, description: e.target.value })} />
              <button type="submit" disabled={saving} className="w-full bg-pink-500 hover:bg-pink-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Formula</button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-cyan-400" />
              Upload Diagram
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'diagram')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Title" value={diagramForm.title} onChange={(e) => setDiagramForm({ ...diagramForm, title: e.target.value })} />
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Image URL" value={diagramForm.imageUrl} onChange={(e) => setDiagramForm({ ...diagramForm, imageUrl: e.target.value })} />
              <input className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Category" value={diagramForm.category} onChange={(e) => setDiagramForm({ ...diagramForm, category: e.target.value })} />
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Labels (comma separated)" value={diagramForm.labels} onChange={(e) => setDiagramForm({ ...diagramForm, labels: e.target.value })} />
              <button type="submit" disabled={saving} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Diagram</button>
            </form>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Upload Handbook
            </h3>
            <form onSubmit={(e) => handleUpload(e, 'handbook')} className="space-y-3">
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="Title" value={handbookForm.title} onChange={(e) => setHandbookForm({ ...handbookForm, title: e.target.value })} />
              <select className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" value={handbookForm.subject} onChange={(e) => setHandbookForm({ ...handbookForm, subject: e.target.value })}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input required className="w-full bg-dark-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-slate-200 text-sm" placeholder="File URL (PDF link)" value={handbookForm.fileUrl} onChange={(e) => setHandbookForm({ ...handbookForm, fileUrl: e.target.value })} />
              <button type="submit" disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 rounded-xl font-medium text-sm disabled:opacity-70">Upload Handbook</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
