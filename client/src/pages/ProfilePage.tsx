import React, { useState, useEffect } from 'react';
import { User, Shield, Trophy, Crosshair, Skull, Activity, ArrowLeft } from 'lucide-react';
import { PlayerStats, UserProfile } from '../types';
import { fetchPlayerStats } from '../services/supabase';

interface ProfilePageProps {
  user: UserProfile;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [stats, setStats] = useState<PlayerStats>({
    matches_played: 0,
    matches_won: 0,
    total_kills: 0,
    total_deaths: 0,
    win_rate_pct: 0,
    kd_ratio: 0,
  });

  useEffect(() => {
    fetchPlayerStats(user.id).then(setStats);
  }, [user.id]);

  return (
    <div className="min-h-screen bg-[#07090e] p-4 md:p-8 max-w-4xl mx-auto w-full">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-orbitron text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>RETURN TO DASHBOARD</span>
      </button>

      {/* Main Profile Header */}
      <div className="glass-panel-neon p-6 md:p-8 rounded-3xl border border-arena-neon/30 mb-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-arena-neon shadow-neon overflow-hidden flex items-center justify-center">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h1 className="text-3xl font-orbitron font-extrabold text-white">{user.username}</h1>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono bg-arena-neon/15 text-arena-neon border border-arena-neon/40 self-center sm:self-auto">
              {user.isGuest ? 'GUEST COMBATANT' : 'VERIFIED STRIKER'}
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono">Pilot Identifier: {user.id}</p>
          {user.email && <p className="text-slate-500 text-xs mt-0.5">{user.email}</p>}
        </div>
      </div>

      {/* Career Telemetry Statistics */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800 mb-8">
        <h2 className="text-xl font-orbitron font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-arena-neon" />
          <span>CAREER COMBAT RECORD</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Shield className="w-4 h-4 text-arena-neon" /> Matches Deployed
            </div>
            <span className="text-2xl font-orbitron font-black text-white">{stats.matches_played}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Trophy className="w-4 h-4 text-amber-400" /> Matches Won
            </div>
            <span className="text-2xl font-orbitron font-black text-amber-400">{stats.matches_won}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Crosshair className="w-4 h-4 text-arena-neon" /> Total Eliminations
            </div>
            <span className="text-2xl font-orbitron font-black text-white">{stats.total_kills}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Skull className="w-4 h-4 text-slate-500" /> Total Fatalities
            </div>
            <span className="text-2xl font-orbitron font-black text-slate-400">{stats.total_deaths}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Activity className="w-4 h-4 text-arena-laser" /> Kill / Death Ratio
            </div>
            <span className="text-2xl font-orbitron font-black text-arena-laser">{stats.kd_ratio}</span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-orbitron mb-1">
              <Trophy className="w-4 h-4 text-emerald-400" /> Win Rate
            </div>
            <span className="text-2xl font-orbitron font-black text-emerald-400">{stats.win_rate_pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
