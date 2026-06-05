import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import AIPlanner from './pages/AIPlanner';
import MockTests from './pages/MockTests';
import Formulas from './pages/Formulas';
import Diagrams from './pages/Diagrams';
import Handbook from './pages/Handbook';
import RevisionTracker from './pages/RevisionTracker';
import PreviousPapers from './pages/PreviousPapers';
import AdminPanel from './pages/AdminPanel';
import { useAuthStore } from './store/authStore';
import { authApi } from './lib/api';
import LoadingState from './components/LoadingState';

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppLayout() {
  const { isAuthenticated, logout, token, refreshToken, updateUser } = useAuthStore();
  const [booting, setBooting] = React.useState(true);
  const location = useLocation();
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);
  const isAuthForm = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const showNav = isAuthenticated && !isPublicPage && !isAuthForm;

  useEffect(() => {
    if (!token || token === 'mock_token') {
      if (token === 'mock_token') logout();
      setBooting(false);
      return;
    }
    authApi.getProfile()
      .then((res) => updateUser(res.data))
      .catch((err) => {
        if (err.response?.status === 401) logout();
      })
      .finally(() => setBooting(false));
  }, [token, logout, updateUser]);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout({ refreshToken });
    } catch {
      /* ignore */
    }
    logout();
  };

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated && isAuthForm) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated && !isPublicPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black pointer-events-none" />
      {showNav && <Navbar onLogout={handleLogout} />}
      <div className="flex flex-1">
        {showNav && <Sidebar />}
        <main className={`flex-1 p-4 md:p-6 overflow-y-auto ${showNav ? 'pb-nav' : ''} ${isAuthForm ? 'flex items-center justify-center' : ''}`}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><AIPlanner /></ProtectedRoute>} />
            <Route path="/mock-tests" element={<ProtectedRoute><MockTests /></ProtectedRoute>} />
            <Route path="/papers" element={<ProtectedRoute><PreviousPapers /></ProtectedRoute>} />
            <Route path="/formulas" element={<ProtectedRoute><Formulas /></ProtectedRoute>} />
            <Route path="/diagrams" element={<ProtectedRoute><Diagrams /></ProtectedRoute>} />
            <Route path="/handbook" element={<ProtectedRoute><Handbook /></ProtectedRoute>} />
            <Route path="/revision" element={<ProtectedRoute><RevisionTracker /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
            <Route path="/settings" element={<Navigate to="/planner" replace />} />

            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
          </Routes>
        </main>
      </div>
      {showNav && <ChatBot />}
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
