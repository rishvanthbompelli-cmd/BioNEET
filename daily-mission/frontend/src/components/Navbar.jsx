import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon, Shield, Menu, X, LayoutDashboard, BookOpen, LayoutTemplate, RotateCcw, FileText, FlaskConical, Image as ImageIcon, BookMarked, Award, Brain } from 'lucide-react';

const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Brain, label: 'AI Planner', path: '/planner' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: LayoutTemplate, label: 'Mock Tests', path: '/mock-tests' },
  { icon: RotateCcw, label: 'Revision', path: '/revision' },
  { icon: FileText, label: 'Papers', path: '/papers' },
  { icon: FlaskConical, label: 'Formulas', path: '/formulas' },
  { icon: ImageIcon, label: 'Diagrams', path: '/diagrams' },
  { icon: BookMarked, label: 'Handbook', path: '/handbook' },
  { icon: Award, label: 'Analytics', path: '/analytics' },
];

export default function Navbar({ onLogout }) {
  const { user, isAuthenticated } = useAuthStore();
  const logout = onLogout || useAuthStore.getState().logout;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      <nav className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-300 hover:text-white">
              <Menu size={24} />
            </button>
          )}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="group text-2xl font-bold text-gradient glow-effect">
            BioNEET
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-slate-300">
                <UserIcon size={18} className="text-primary-400" />
                <span>{user?.name}</span>
              </div>
              <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold border border-primary-500/30">
                🔥 {user?.streak || 0}
              </div>
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-accent-500/20 text-accent-300 px-3 py-1.5 rounded-full text-sm font-semibold border border-accent-500/30 hover:bg-accent-500/30 transition-colors"
                >
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-400 transition-colors hidden md:block ml-4"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-primary-500 hover:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="w-64 h-full bg-dark-900 border-r border-white/10 shadow-2xl flex flex-col transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2 text-slate-300">
                <UserIcon size={18} className="text-primary-400" />
                <span className="font-semibold truncate">{user?.name}</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm bg-accent-500/10 text-accent-400 mb-2"
                >
                  <Shield size={18} />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}
              
              {mobileNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"
                >
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
            
            <div className="p-4 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2.5 rounded-xl transition-colors text-sm font-medium">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
