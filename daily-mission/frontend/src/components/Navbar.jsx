import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, Shield, Menu, X, LayoutDashboard, BookOpen, LayoutTemplate, RotateCcw, FileText, FlaskConical, Image as ImageIcon, BookMarked, Award, Brain, Target, GraduationCap } from 'lucide-react';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Brain, label: 'AI Planner', path: '/planner' },
  { icon: Target, label: 'NEET Rank', path: '/rank-predictor-neet' },
  { icon: GraduationCap, label: 'EAPCET Rank', path: '/rank-predictor-eapcet' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: LayoutTemplate, label: 'Mock Tests', path: '/mock-tests' },
  { icon: RotateCcw, label: 'Revision', path: '/revision' },
  { icon: FileText, label: 'Papers', path: '/papers' },
  { icon: FlaskConical, label: 'Formulas', path: '/formulas' },
  { icon: ImageIcon, label: 'Diagrams', path: '/diagrams' },
  { icon: BookMarked, label: 'Handbook', path: '/handbook' },
  { icon: Award, label: 'Analytics', path: '/analytics' },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: '-100%', transition: { type: 'tween', duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

export default function Navbar({ onLogout }) {
  const { user, isAuthenticated } = useAuthStore();
  const logout = onLogout || useAuthStore.getState().logout;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-300 hover:text-white p-1"
            >
              <Menu size={24} />
            </motion.button>
          )}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="group text-2xl font-bold text-gradient glow-effect">
            BioNEET
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-slate-300">
                <UserIcon size={18} className="text-primary-400" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold border border-primary-500/30">
                🔥 {user?.streak || 0}
              </div>
              {user?.isAdmin && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-2 bg-accent-500/20 text-accent-300 px-3 py-1.5 rounded-full text-sm font-semibold border border-accent-500/30 hover:bg-accent-500/30 transition-colors"
                  >
                    <Shield size={16} /> Admin
                  </Link>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={logout}
                className="text-slate-400 hover:text-red-400 transition-colors hidden md:block ml-2"
                title="Logout"
              >
                <LogOut size={20} />
              </motion.button>
            </>
          ) : (
            <div className="flex gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm">
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                  Sign Up
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay — Animated */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="relative w-72 max-w-[85vw] h-full bg-dark-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2 text-slate-300 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                    <UserIcon size={16} className="text-primary-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold truncate block text-sm">{user?.name}</span>
                    <span className="text-xs text-slate-500">🔥 {user?.streak || 0} day streak</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.85, rotate: 90 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X size={22} />
                </motion.button>
              </div>

              {/* Nav Items */}
              <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 overscroll-contain">
                {user?.isAdmin && (
                  <motion.div
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm mb-1 ${
                        location.pathname === '/admin'
                          ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
                          : 'bg-accent-500/10 text-accent-400 hover:bg-accent-500/15'
                      }`}
                    >
                      <Shield size={18} />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  </motion.div>
                )}

                {mobileNavItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    custom={index + 1}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm ${
                        location.pathname === item.path
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      <item.icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl transition-colors text-sm font-medium"
                >
                  <LogOut size={18} /> Logout
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
