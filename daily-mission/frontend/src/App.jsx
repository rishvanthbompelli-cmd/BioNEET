import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';
import LoadingState from './components/LoadingState';
import PageTransition from './components/PageTransition';
import { useAuthStore } from './store/authStore';
import { authApi } from './lib/api';

// Lazy load all pages for code splitting & faster initial load
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notes = lazy(() => import('./pages/Notes'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AIPlanner = lazy(() => import('./pages/AIPlanner'));
const MockTests = lazy(() => import('./pages/MockTests'));
const Formulas = lazy(() => import('./pages/Formulas'));
const Diagrams = lazy(() => import('./pages/Diagrams'));
const Handbook = lazy(() => import('./pages/Handbook'));
const RevisionTracker = lazy(() => import('./pages/RevisionTracker'));
const PreviousPapers = lazy(() => import('./pages/PreviousPapers'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));
const RankPredictorNEET = lazy(() => import('./pages/RankPredictorNEET'));
const RankPredictorEAPCET = lazy(() => import('./pages/RankPredictorEAPCET'));

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Minimal inline spinner for Suspense fallback (no extra component load)
function SuspenseSpinner() {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition>{isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}</PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />

        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><PageTransition><Notes /></PageTransition></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PageTransition><Analytics /></PageTransition></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PageTransition><AIPlanner /></PageTransition></ProtectedRoute>} />
        <Route path="/mock-tests" element={<ProtectedRoute><PageTransition><MockTests /></PageTransition></ProtectedRoute>} />
        <Route path="/papers" element={<ProtectedRoute><PageTransition><PreviousPapers /></PageTransition></ProtectedRoute>} />
        <Route path="/formulas" element={<ProtectedRoute><PageTransition><Formulas /></PageTransition></ProtectedRoute>} />
        <Route path="/diagrams" element={<ProtectedRoute><PageTransition><Diagrams /></PageTransition></ProtectedRoute>} />
        <Route path="/handbook" element={<ProtectedRoute><PageTransition><Handbook /></PageTransition></ProtectedRoute>} />
        <Route path="/revision" element={<ProtectedRoute><PageTransition><RevisionTracker /></PageTransition></ProtectedRoute>} />
        <Route path="/rank-predictor-neet" element={<ProtectedRoute><PageTransition><RankPredictorNEET /></PageTransition></ProtectedRoute>} />
        <Route path="/rank-predictor-eapcet" element={<ProtectedRoute><PageTransition><RankPredictorEAPCET /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><PageTransition><AdminPanel /></PageTransition></ProtectedRoute>} />
        <Route path="/settings" element={<Navigate to="/planner" replace />} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

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
      <div className="min-h-[100dvh] flex items-center justify-center">
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
    <div className="flex flex-col min-h-[100dvh] relative">
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black pointer-events-none" />
      {showNav && <Navbar onLogout={handleLogout} />}
      <div className="flex flex-1 overflow-hidden">
        {showNav && <Sidebar />}
        <main className={`flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 pb-28 md:pb-6 ${isAuthForm ? 'flex items-center justify-center' : ''}`}>
          <Suspense fallback={<SuspenseSpinner />}>
            <AnimatedRoutes />
          </Suspense>
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
