import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, RotateCw, ArrowLeft } from 'lucide-react';
import { fetchLeaderboard } from '../services/supabase';

interface LeaderboardPageProps {
  onBack: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onBack }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = () => {
    setLoading(true);
    fetchLeaderboard()
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#07090e] p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-orbitron text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO DASHBOARD</span>
        </button>

        <button
          onClick={loadLeaderboard}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all active:scale-95"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-laser">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-orbitron font-extrabold text-white">GLOBAL PILOT RANKINGS</h1>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Real-time standings based on authenticated match outcomes</p>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-panel-neon rounded-3xl overflow-hidden border border-arena-neon/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-orbitron text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Pilot Callsign</th>
                <th className="py-4 px-6 text-center">Matches</th>
                <th className="py-4 px-6 text-center">Victories</th>
                <th className="py-4 px-6 text-center">Kills</th>
                <th className="py-4 px-6 text-center">Deaths</th>
                <th className="py-4 px-6 text-center">Win Rate</th>
                <th className="py-4 px-6 text-right">K/D Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    <span className="inline-block animate-spin w-5 h-5 border-2 border-arena-neon border-t-transparent rounded-full mr-2" />
                    Connecting to telemetry server...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-orbitron text-sm">
                    No competitive match records yet. Be the first to claim victory!
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr
                      key={row.user_id || idx}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        rank === 1 ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-orbitron font-bold">
                        {rank === 1 ? (
                          <span className="flex items-center gap-1.5 text-amber-400">
                            <Trophy className="w-4 h-4" /> #1
                          </span>
                        ) : rank === 2 ? (
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Medal className="w-4 h-4 text-slate-300" /> #2
                          </span>
                        ) : rank === 3 ? (
                          <span className="flex items-center gap-1.5 text-amber-700">
                            <Award className="w-4 h-4 text-amber-600" /> #3
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">#{rank}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                          <img
                            src={row.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.username}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>{row.username}</span>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-400 font-mono">{row.matches_played}</td>
                      <td className="py-4 px-6 text-center font-orbitron font-bold text-amber-400">{row.matches_won}</td>
                      <td className="py-4 px-6 text-center font-mono font-bold text-white">{row.total_kills}</td>
                      <td className="py-4 px-6 text-center font-mono text-slate-500">{row.total_deaths}</td>
                      <td className="py-4 px-6 text-center font-mono text-arena-neon font-bold">{row.win_rate_pct}%</td>
                      <td className="py-4 px-6 text-right font-mono text-arena-laser font-bold">{row.kd_ratio}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
