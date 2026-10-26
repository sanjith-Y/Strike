import React, { useState } from 'react';
import {
  Crosshair as CrosshairIcon,
  Shield,
  Activity,
  Trophy,
  Skull,
  Clock,
  Volume2,
  Settings,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { KillNotification, MatchResultData, ScoreboardEntry } from '../types';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  ammo: number;
  reserveAmmo: number;
  isReloading: boolean;
  kills: number;
  deaths: number;
  matchTimeRemaining: number;
  isDead: boolean;
  respawnTimeRemaining: number;
  hitMarkerActive: boolean;
  damageFlashActive: boolean;
  killfeed: KillNotification[];
  scoreboard: ScoreboardEntry[];
  showScoreboard: boolean;
  matchResult: MatchResultData | null;
  currentUserId: string;
  isPointerLocked: boolean;
  onLockPointer: () => void;
  onReload: () => void;
  onLeaveMatch: () => void;
  onPlayAgain?: () => void;
  crosshairColor?: string;
  crosshairStyle?: string;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  maxHealth,
  ammo,
  reserveAmmo,
  isReloading,
  kills,
  deaths,
  matchTimeRemaining,
  isDead,
  respawnTimeRemaining,
  hitMarkerActive,
  damageFlashActive,
  killfeed,
  scoreboard,
  showScoreboard,
  matchResult,
  currentUserId,
  isPointerLocked,
  onLockPointer,
  onReload,
  onLeaveMatch,
  onPlayAgain,
  crosshairColor = '#00f0ff',
  crosshairStyle = 'classic',
}) => {
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  // Format timer
  const minutes = Math.floor(matchTimeRemaining / 60);
  const seconds = matchTimeRemaining % 60;
  const timerStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowHealth = health <= 30 && health > 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
      {/* 1. Fullscreen Damage Flash overlay */}
      {damageFlashActive && (
        <div className="absolute inset-0 bg-red-600/30 border-4 border-red-500 animate-pulse pointer-events-none transition-opacity duration-150" />
      )}

      {/* 2. Low Health Red Vignette */}
      {isLowHealth && (
        <div className="absolute inset-0 bg-radial-vignette from-transparent via-red-950/20 to-red-900/40 pointer-events-none animate-pulse" />
      )}

      {/* 3. Pointer Lock Activation Prompt (Desktop) */}
      {!isPointerLocked && !matchResult && !isDead && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center cursor-pointer z-40"
          onClick={onLockPointer}
        >
          <div className="glass-panel-neon p-6 md:p-8 rounded-2xl text-center max-w-md mx-4 animate-bounce-subtle">
            <CrosshairIcon className="w-12 h-12 text-arena-neon mx-auto mb-3 animate-spin-slow" />
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">ENGAGE COMBAT</h2>
            <p className="text-slate-300 text-sm mb-4">Click anywhere to lock cursor and control your pilot.</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-700">
              <div><span className="text-arena-neon font-bold">W, A, S, D</span> — Move</div>
              <div><span className="text-arena-neon font-bold">Mouse</span> — Aim & Look</div>
              <div><span className="text-arena-neon font-bold">Left Click</span> — Shoot</div>
              <div><span className="text-arena-neon font-bold">R</span> — Reload</div>
              <div><span className="text-arena-neon font-bold">Space</span> — Jump</div>
              <div><span className="text-arena-neon font-bold">Shift</span> — Sprint</div>
            </div>
            <div className="mt-4 text-xs text-slate-500">Press <span className="text-white font-mono">ESC</span> anytime to release cursor</div>
          </div>
        </div>
      )}

      {/* 4. Crosshair and Hit Marker */}
      {!isDead && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          {/* Main Crosshair */}
          {crosshairStyle === 'dot' ? (
            <div
              className="w-2.5 h-2.5 rounded-full shadow-neon"
              style={{ backgroundColor: crosshairColor }}
            />
          ) : (
            <div className="relative w-7 h-7 flex items-center justify-center">
              <div className="absolute w-2 h-0.5" style={{ backgroundColor: crosshairColor, left: 0 }} />
              <div className="absolute w-2 h-0.5" style={{ backgroundColor: crosshairColor, right: 0 }} />
              <div className="absolute h-2 w-0.5" style={{ backgroundColor: crosshairColor, top: 0 }} />
              <div className="absolute h-2 w-0.5" style={{ backgroundColor: crosshairColor, bottom: 0 }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: crosshairColor }} />
            </div>
          )}

          {/* Hit Marker Pulse */}
          {hitMarkerActive && (
            <div className="absolute w-8 h-8 pointer-events-none animate-hitmarker">
              <div className="absolute top-0 left-0 w-2.5 h-0.5 bg-red-500 rotate-45 transform origin-top-left" />
              <div className="absolute top-0 right-0 w-2.5 h-0.5 bg-red-500 -rotate-45 transform origin-top-right" />
              <div className="absolute bottom-0 left-0 w-2.5 h-0.5 bg-red-500 -rotate-45 transform origin-bottom-left" />
              <div className="absolute bottom-0 right-0 w-2.5 h-0.5 bg-red-500 rotate-45 transform origin-bottom-right" />
            </div>
          )}
        </div>
      )}

      {/* 5. Top Bar: Match Timer, Scores, Killfeed */}
      <div className="flex justify-between items-start w-full">
        {/* Match Timer & Kill Count */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-700/80">
            <Clock className="w-5 h-5 text-arena-neon animate-pulse" />
            <span className="font-orbitron font-bold text-lg md:text-xl text-white tracking-wider">{timerStr}</span>
          </div>

          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 border border-slate-700/80">
            <div className="flex items-center gap-1.5 text-arena-neon">
              <CrosshairIcon className="w-4 h-4" />
              <span className="font-orbitron font-bold text-base">{kills}</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <Skull className="w-4 h-4" />
              <span className="font-orbitron font-bold text-base">{deaths}</span>
            </div>
          </div>
        </div>

        {/* Killfeed Notifications */}
        <div className="flex flex-col items-end gap-1.5 max-w-xs">
          {killfeed.slice(0, 4).map((kf) => (
            <div
              key={kf.id}
              className="glass-panel px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 border border-slate-800 animate-slide-in"
            >
              <span className={kf.isLocalKiller ? 'text-arena-neon font-bold' : 'text-slate-200'}>
                {kf.killerName}
              </span>
              <CrosshairIcon className="w-3.5 h-3.5 text-arena-laser" />
              <span className={kf.isLocalVictim ? 'text-red-400 font-bold' : 'text-slate-400'}>
                {kf.victimName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Respawn Overlay (When eliminated) */}
      {isDead && (
        <div className="absolute inset-0 bg-red-950/70 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto z-40">
          <Skull className="w-16 h-16 text-red-500 mb-2 animate-bounce" />
          <h2 className="text-3xl font-orbitron font-extrabold text-white mb-1">YOU WERE ELIMINATED</h2>
          <p className="text-slate-300 text-sm mb-4">Re-arming system and selecting safe drop zone...</p>
          <div className="glass-panel px-6 py-3 rounded-2xl border border-red-500/50 flex items-center gap-3">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Respawn In</span>
            <span className="text-3xl font-orbitron font-black text-arena-neon">{respawnTimeRemaining}s</span>
          </div>
        </div>
      )}

      {/* 7. Bottom Bar: Health Indicator & Weapon/Ammo */}
      <div className="flex justify-between items-end w-full">
        {/* Health Indicator */}
        <div className="glass-panel-neon p-3 md:p-4 rounded-2xl flex flex-col gap-2 min-w-[200px] md:min-w-[240px]">
          <div className="flex items-center justify-between text-xs font-orbitron uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Shield className="w-4 h-4 text-arena-neon" /> Vitals
            </span>
            <span className={`font-bold ${isLowHealth ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {health} / {maxHealth}
            </span>
          </div>

          <div className="w-full bg-slate-900/90 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isLowHealth ? 'bg-red-500' : 'bg-gradient-to-r from-arena-accent to-arena-neon'
              }`}
              style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }}
            />
          </div>
        </div>

        {/* Weapon & Ammo Counter */}
        <div className="glass-panel-neon p-3 md:p-4 rounded-2xl flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-orbitron text-arena-neon tracking-wider font-semibold">AR-7 VALKYRIE</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl md:text-3xl font-orbitron font-black ${ammo <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {ammo}
              </span>
              <span className="text-sm font-orbitron text-slate-400 font-bold">/ {reserveAmmo}</span>
            </div>
            {isReloading && (
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                <RotateCcw className="w-3 h-3 animate-spin" /> RELOADING...
              </span>
            )}
          </div>

          <button
            onClick={onReload}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-200 pointer-events-auto active:scale-95 transition-all"
            title="Reload Weapon (R)"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 8. Live TAB Scoreboard Overlay */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center pointer-events-auto z-40">
          <div className="glass-panel-neon p-6 md:p-8 rounded-3xl max-w-2xl w-full mx-4 border border-arena-neon/40">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-arena-neon" />
                <h3 className="text-2xl font-orbitron font-bold text-white">TACTICAL SCOREBOARD</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">HOLD [TAB] TO VIEW</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/90 text-slate-400 font-orbitron text-xs">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Pilot</th>
                    <th className="py-3 px-4 text-center">Kills</th>
                    <th className="py-3 px-4 text-center">Deaths</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {scoreboard.map((entry, idx) => (
                    <tr
                      key={entry.userId}
                      className={entry.userId === currentUserId ? 'bg-arena-neon/10 font-semibold' : 'bg-slate-950/40'}
                    >
                      <td className="py-3 px-4 font-orbitron text-arena-neon">#{idx + 1}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span>{entry.username}</span>
                        {entry.userId === currentUserId && (
                          <span className="text-[10px] bg-arena-neon text-black font-bold px-1.5 py-0.5 rounded">YOU</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">{entry.kills}</td>
                      <td className="py-3 px-4 text-center text-slate-400">{entry.deaths}</td>
                      <td className="py-3 px-4 text-right font-orbitron font-bold text-arena-accent">{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9. Match Completed Screen */}
      {matchResult && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center pointer-events-auto z-50 p-4">
          <div className="glass-panel-neon p-6 md:p-8 rounded-3xl max-w-xl w-full border border-arena-neon/60 text-center animate-fade-in">
            {matchResult.winnerUserId === currentUserId ? (
              <>
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <h2 className="text-3xl md:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200 mb-1">
                  VICTORY ROYALE
                </h2>
                <p className="text-slate-300 text-sm mb-6">Supreme performance, Commander. You dominated the arena!</p>
              </>
            ) : (
              <>
                <Skull className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <h2 className="text-3xl md:text-4xl font-orbitron font-black text-white mb-1">
                  MATCH CONCLUDED
                </h2>
                <p className="text-slate-300 text-sm mb-6">Winner: <span className="text-arena-neon font-bold">{matchResult.winnerUsername}</span></p>
              </>
            )}

            {/* Final Standings Table */}
            <div className="rounded-xl overflow-hidden border border-slate-800 mb-6 max-h-60 overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900 text-slate-400 font-orbitron text-xs">
                  <tr>
                    <th className="py-2.5 px-4">Place</th>
                    <th className="py-2.5 px-4">Pilot</th>
                    <th className="py-2.5 px-4 text-center">K / D</th>
                    <th className="py-2.5 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {matchResult.scoreboard.map((p) => (
                    <tr
                      key={p.userId}
                      className={p.userId === currentUserId ? 'bg-arena-neon/15 font-bold' : 'bg-slate-950/60'}
                    >
                      <td className="py-2 px-4 font-orbitron text-arena-neon">#{p.placement}</td>
                      <td className="py-2 px-4 text-slate-200">{p.username}</td>
                      <td className="py-2 px-4 text-center">{p.kills} / {p.deaths}</td>
                      <td className="py-2 px-4 text-right font-orbitron text-arena-accent">{p.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-center">
              {onPlayAgain && (
                <button
                  onClick={onPlayAgain}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-arena-accent to-arena-neon text-black font-orbitron font-bold text-sm shadow-neon hover:opacity-90 active:scale-95 transition-all"
                >
                  PLAY AGAIN
                </button>
              )}
              <button
                onClick={onLeaveMatch}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-orbitron font-semibold text-sm active:scale-95 transition-all"
              >
                RETURN TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
