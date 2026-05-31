import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import MCQs from './pages/MCQs';
import Analytics from './pages/Analytics';
import AIPlanner from './pages/AIPlanner';
import QuizGenerator from './pages/QuizGenerator';
import MockTests from './pages/MockTests';
import Formulas from './pages/Formulas';
import Diagrams from './pages/Diagrams';
import Handbook from './pages/Handbook';
import RevisionTracker from './pages/RevisionTracker';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function AppLayout() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);
  const showNav = isAuthenticated && !isPublicPage;

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black pointer-events-none" />
      <Navbar />
      <div className="flex flex-1">
        {showNav && <Sidebar />}
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${showNav ? 'pb-nav' : ''}`}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/mcqs" element={<ProtectedRoute><MCQs /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><AIPlanner /></ProtectedRoute>} />
            <Route path="/quiz-gen" element={<ProtectedRoute><QuizGenerator /></ProtectedRoute>} />
            <Route path="/mock-tests" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
            <Route path="/formulas" element={<ProtectedRoute><Formulas /></ProtectedRoute>} />
            <Route path="/diagrams" element={<ProtectedRoute><Diagrams /></ProtectedRoute>} />
            <Route path="/handbook" element={<ProtectedRoute><Handbook /></ProtectedRoute>} />
            <Route path="/revision" element={<ProtectedRoute><RevisionTracker /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} />} />
          </Routes>
        </main>
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
