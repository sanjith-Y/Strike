import React from 'react';
import { Crosshair, Trophy, Settings as SettingsIcon, User, LogOut, Swords } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  currentTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, currentTab, onNavigate, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800/80 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-neon group-hover:scale-105 transition-transform">
            <Crosshair className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-extrabold text-lg tracking-wider text-white group-hover:text-arena-neon transition-colors">
              ARENA<span className="text-arena-neon">STRIKE</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest -mt-1">3D MULTIPLAYER</span>
          </div>
        </div>

        {/* Navigation Links */}
        {user ? (
          <nav className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-orbitron font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-arena-neon/15 text-arena-neon border border-arena-neon/30 shadow-neon'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Battle</span>
            </button>

            <button
              onClick={() => onNavigate('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-orbitron font-medium transition-all ${
                currentTab === 'leaderboard'
                  ? 'bg-arena-neon/15 text-arena-neon border border-arena-neon/30 shadow-neon'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Rankings</span>
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-orbitron font-medium transition-all ${
                currentTab === 'profile'
                  ? 'bg-arena-neon/15 text-arena-neon border border-arena-neon/30 shadow-neon'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.username}</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className={`p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all ${
                currentTab === 'settings' ? 'text-arena-neon bg-arena-neon/15' : ''
              }`}
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('auth_login')}
              className="text-xs md:text-sm font-orbitron text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('auth_register')}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-orbitron font-bold text-xs md:text-sm shadow-neon active:scale-95 transition-all"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
