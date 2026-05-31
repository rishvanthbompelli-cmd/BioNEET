import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="group text-2xl font-bold text-gradient glow-effect">
        Daily Mission
      </Link>
      
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 text-slate-300">
              <UserIcon size={18} className="text-primary-400" />
              <span className="hidden md:inline">{user?.name}</span>
            </div>
            <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-semibold border border-primary-500/30">
              🔥 Streak: {user?.streak || 0}
            </div>
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
