import React, { useState } from 'react';
import {
  Copy,
  Check,
  Crown,
  Users,
  Clock,
  Crosshair,
  ShieldAlert,
  Play,
  LogOut,
  Share2,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { RoomPlayer, RoomSettings, RoomState, UserProfile } from '../types';

interface LobbyPageProps {
  room: RoomState;
  currentUser: UserProfile;
  onToggleReady: (isReady: boolean) => void;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
  error?: string | null;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  room,
  currentUser,
  onToggleReady,
  onUpdateSettings,
  onStartMatch,
  onLeaveRoom,
  error,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOwner = room.ownerId === currentUser.id;
  const myPlayer = room.players.find((p) => p.id === currentUser.id);
  const isReady = myPlayer?.isReady || false;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareLink = () => {
    const inviteUrl = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Ready status check
  const nonOwnerPlayers = room.players.filter((p) => !p.isOwner);
  const allNonOwnersReady = nonOwnerPlayers.every((p) => p.isReady);
  const canStart = isOwner && (room.players.length >= 1) && allNonOwnersReady;

  return (
    <div className="min-h-screen bg-[#07090e] p-4 md:p-8 max-w-6xl mx-auto w-full flex flex-col justify-between">
      <div>
        {/* Header Ribbon: Room Code & Share */}
        <div className="glass-panel-neon p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-arena-neon/40">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-arena-neon tracking-widest uppercase">STRIKE LOBBY</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <h1 className="text-3xl md:text-4xl font-orbitron font-black tracking-widest text-white">
                {room.code}
              </h1>
              <button
                onClick={copyCode}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'COPIED' : 'COPY CODE'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={copyShareLink}
              className="flex-1 md:flex-initial px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-orbitron text-xs font-bold border border-slate-700 hover:border-arena-neon/40 flex items-center justify-center gap-2 transition-all"
            >
              <Share2 className="w-4 h-4 text-arena-neon" />
              <span>{copiedLink ? 'LINK COPIED!' : 'SHARE INVITE LINK'}</span>
            </button>

            <button
              onClick={onLeaveRoom}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 font-orbitron text-xs font-bold border border-slate-800 hover:border-red-500/40 transition-all flex items-center gap-2"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4" />
              <span>LEAVE</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-300 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Players Roster */}
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-arena-neon" />
                <span>COMBAT SQUAD</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {room.players.length} / {room.settings.maxPlayers} PILOTS
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {room.players.map((p) => {
                const isMe = p.id === currentUser.id;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isMe ? 'bg-slate-900/90 border-arena-neon/50 shadow-neon' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                        <img
                          src={p.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                          alt={p.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-orbitron font-bold text-sm text-white">{p.username}</span>
                          {p.isOwner && (
                            <span title="Room Host">
                              <Crown className="w-4 h-4 text-amber-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {isMe ? '(You)' : p.isOwner ? 'Squad Leader' : 'Pilot'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {p.isReady ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> READY
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                          WAITING
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty slot placeholders */}
              {Array.from({ length: room.settings.maxPlayers - room.players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-4 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-600 font-mono"
                >
                  SLOT {room.players.length + i + 1} AVAILABLE
                </div>
              ))}
            </div>
          </div>

          {/* Match Configuration & Settings */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-orbitron font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>RULES OF COMBAT</span>
              </h2>

              <div className="space-y-5">
                {/* Match Duration */}
                <div>
                  <div className="flex justify-between text-xs font-orbitron mb-2">
                    <span className="text-slate-400">Match Duration</span>
                    <span className="text-white font-bold">{Math.round(room.settings.matchDurationSec / 60)} Minutes</span>
                  </div>
                  {isOwner ? (
                    <div className="flex gap-2">
                      {[180, 300, 600].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => onUpdateSettings({ matchDurationSec: sec })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                            room.settings.matchDurationSec === sec
                              ? 'bg-arena-neon/20 border-arena-neon text-arena-neon'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {sec / 60}m
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-2.5 rounded-xl text-xs text-slate-300 font-mono border border-slate-800">
                      {room.settings.matchDurationSec / 60} Minutes
                    </div>
                  )}
                </div>

                {/* Kill Target */}
                <div>
                  <div className="flex justify-between text-xs font-orbitron mb-2">
                    <span className="text-slate-400">Kill Target</span>
                    <span className="text-white font-bold">{room.settings.killTarget} Kills</span>
                  </div>
                  {isOwner ? (
                    <div className="flex gap-2">
                      {[10, 20, 30].map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => onUpdateSettings({ killTarget: k })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                            room.settings.killTarget === k
                              ? 'bg-arena-laser/20 border-arena-laser text-arena-laser'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-2.5 rounded-xl text-xs text-slate-300 font-mono border border-slate-800">
                      {room.settings.killTarget} Kills to Win
                    </div>
                  )}
                </div>

                {/* Respawn Delay */}
                <div>
                  <div className="flex justify-between text-xs font-orbitron mb-2">
                    <span className="text-slate-400">Respawn Delay</span>
                    <span className="text-white font-bold">{room.settings.respawnDelaySec} Seconds</span>
                  </div>
                  {isOwner ? (
                    <div className="flex gap-2">
                      {[2, 3, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => onUpdateSettings({ respawnDelaySec: s })}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                            room.settings.respawnDelaySec === s
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900 p-2.5 rounded-xl text-xs text-slate-300 font-mono border border-slate-800">
                      {room.settings.respawnDelaySec} Seconds
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <span className="text-[11px] text-slate-500 block text-center mb-1">
                {isOwner ? 'You are the squad leader.' : 'Waiting for squad leader to deploy...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls: Ready & Start Match */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle Ready Button (Non-owners) */}
        {!isOwner ? (
          <button
            onClick={() => onToggleReady(!isReady)}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-orbitron font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isReady
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-neon'
                : 'bg-slate-900 text-white border border-slate-700 hover:border-arena-neon/50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isReady ? 'CANCEL READY' : 'SET AS READY'}</span>
          </button>
        ) : (
          <div className="text-xs font-mono text-slate-400">
            {allNonOwnersReady ? (
              <span className="text-emerald-400">All pilots are ready for deployment!</span>
            ) : (
              <span>Waiting for pilots to lock in ready status...</span>
            )}
          </div>
        )}

        {/* Start Match Button (Owner only) */}
        {isOwner && (
          <button
            onClick={onStartMatch}
            disabled={!canStart}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-orbitron font-black text-sm transition-all flex items-center justify-center gap-2 ${
              canStart
                ? 'bg-gradient-to-r from-arena-accent to-arena-neon text-black shadow-neon hover:opacity-95 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>DEPLOY ARENA STRIKE</span>
          </button>
        )}
      </div>
    </div>
  );
};
