import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Navbar({ onLogout }) {
  const { user, isAuthenticated } = useAuthStore();
  const logout = onLogout || useAuthStore.getState().logout;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="group text-2xl font-bold text-gradient glow-effect">
        BioNEET
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 text-slate-300">
              <UserIcon size={18} className="text-primary-400" />
              <span className="hidden md:inline">{user?.name}</span>
            </div>
            <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold border border-primary-500/30">
              🔥 {user?.streak || 0}
            </div>
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-accent-500/20 text-accent-300 px-3 py-1.5 rounded-full text-sm font-semibold border border-accent-500/30 hover:bg-accent-500/30 transition-colors"
              >
                <Shield size={16} /> Admin
              </Link>
            )}
            <button
              onClick={logout}
              className="text-slate-400 hover:text-red-400 transition-colors ml-4"
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
  );
}
