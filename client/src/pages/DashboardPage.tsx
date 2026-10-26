import React, { useState, useEffect } from 'react';
import {
  Swords,
  PlusCircle,
  LogIn,
  Trophy,
  Crosshair,
  Skull,
  Shield,
  Activity,
  Zap,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { PlayerStats, UserProfile } from '../types';
import { fetchPlayerStats } from '../services/supabase';

interface DashboardPageProps {
  user: UserProfile;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onCreateRoom,
  onJoinRoom,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [stats, setStats] = useState<PlayerStats>({
    matches_played: 0,
    matches_won: 0,
    total_kills: 0,
    total_deaths: 0,
    win_rate_pct: 0,
    kd_ratio: 0,
  });

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayerStats(user.id).then(setStats);
  }, [user.id]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const code = joinCodeInput.trim().toUpperCase();
    if (!code || code.length < 4) {
      setJoinError('Please enter a valid 6-character room code.');
      return;
    }
    onJoinRoom(code);
  };

  return (
    <div className="min-h-screen bg-[#07090e] p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Pilot Profile & Quick Battle Ribbon */}
      <div className="glass-panel-neon p-6 md:p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-arena-neon/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-900 border-2 border-arena-neon shadow-neon flex items-center justify-center overflow-hidden">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-orbitron font-extrabold text-white">{user.username}</h1>
              {user.isGuest && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  GUEST PILOT
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5">Rank: Combat Ready Specialist</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={onCreateRoom}
            className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-gradient-to-r from-arena-accent to-arena-neon text-black font-orbitron font-bold text-sm shadow-neon hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE ROOM</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-orbitron font-bold text-sm border border-slate-700 hover:border-arena-neon/50 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-arena-neon" />
            <span>JOIN ROOM</span>
          </button>
        </div>
      </div>

      {/* Career Statistics Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-arena-neon" />
          <span>COMBAT TELEMETRY</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Matches</span>
            <span className="text-2xl font-orbitron font-extrabold text-white">{stats.matches_played}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Victories</span>
            <span className="text-2xl font-orbitron font-extrabold text-amber-400">{stats.matches_won}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Win Rate</span>
            <span className="text-2xl font-orbitron font-extrabold text-arena-neon">{stats.win_rate_pct}%</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Total Kills</span>
            <span className="text-2xl font-orbitron font-extrabold text-white">{stats.total_kills}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">Deaths</span>
            <span className="text-2xl font-orbitron font-extrabold text-slate-400">{stats.total_deaths}</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1">K/D Ratio</span>
            <span className="text-2xl font-orbitron font-extrabold text-arena-laser">{stats.kd_ratio}</span>
          </div>
        </div>
      </div>

      {/* Featured Arena & Tactical Briefing */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-arena-neon font-mono uppercase tracking-widest">Active Combat Zone</span>
              <h3 className="text-xl font-orbitron font-bold text-white mt-0.5">CYBER GRID SECTOR 4</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-arena-neon/10 border border-arena-neon/30 text-arena-neon text-xs font-mono">
              3D DEATHMATCH
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            A high-density arena featuring central monument pillars, tactical cover stacks, elevated cross-walks, and symmetrical drop points. Master high-ground sightlines and outflank opponents.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onCreateRoom}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-orbitron text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
            >
              <Swords className="w-4 h-4 text-arena-neon" />
              <span>Host Sector 4 Match</span>
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-orbitron text-xs font-semibold flex items-center gap-2 border border-slate-800 transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>View Leaderboard</span>
            </button>
          </div>
        </div>

        {/* Loadout Briefing */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Standard Loadout</span>
            <h3 className="text-lg font-orbitron font-bold text-white mt-1">AR-7 VALKYRIE</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Fully automatic starter rifle. High rate of fire with 30-round mag and 120 reserve ammo. 25 damage per round.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
            <span>RPM: 480</span>
            <span>Damage: 25 HP</span>
            <span>Reload: 2.0s</span>
          </div>
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel-neon p-6 md:p-8 rounded-3xl max-w-md w-full border border-arena-neon/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-orbitron font-bold text-white">ENTER ROOM CODE</h3>
              <button
                onClick={() => { setShowJoinModal(false); setJoinError(null); }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {joinError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-orbitron text-slate-400 mb-2">
                  Ask the host for their 6-Character code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. W8X4K2"
                  className="w-full text-center text-2xl font-orbitron tracking-widest bg-slate-900 border-2 border-slate-700 rounded-2xl py-4 text-white focus:outline-none focus:border-arena-neon uppercase transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-orbitron font-bold transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-arena-accent to-arena-neon text-black text-xs font-orbitron font-bold shadow-neon hover:opacity-90 active:scale-95 transition-all"
                >
                  CONNECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
