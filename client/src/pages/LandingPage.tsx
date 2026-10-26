import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Play,
  Users,
  Trophy,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  LogIn,
  UserPlus,
  Radio,
  Activity,
  Flame,
  Info,
} from 'lucide-react';
import { soundSystem } from '../services/audio';

interface LandingPageProps {
  onPlayNow: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onJoinRoomDirect?: (code: string) => void;
  onOpenLeaderboard?: () => void;
  onOpenSettings?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayNow,
  onSignIn,
  onSignUp,
  onJoinRoomDirect,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const [quickCode, setQuickCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'armory' | 'intel'>('menu');
  const [serverPing, setServerPing] = useState(18);

  useEffect(() => {
    // Subtle ping simulation
    const interval = setInterval(() => {
      setServerPing(16 + Math.floor(Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    soundSystem.playUIClick();
    if (quickCode.trim().length >= 4 && onJoinRoomDirect) {
      onJoinRoomDirect(quickCode.trim().toUpperCase());
    } else {
      onPlayNow();
    }
  };

  const handleButtonClick = (action: () => void) => {
    soundSystem.playUIClick();
    action();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundSystem.setVolumes(next ? 0.8 : 0, next ? 0.5 : 0);
    if (next) soundSystem.playUIClick();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#07090e] overflow-hidden select-none font-inter text-slate-100 flex flex-col justify-between">
      {/* 1. Cinematic Key Art Background with Vignette & Atmospheric Layers */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/keyart.jpg"
          alt="Arena Strike Cinematic Battleground"
          className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.12] scale-105 transform animate-pulse-slow"
        />
        {/* Dark radial and gradient overlays for high-contrast AAA UI readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090e]/95 via-[#07090e]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/80" />
        <div className="absolute inset-0 bg-radial-vignette from-transparent via-[#07090e]/40 to-[#07090e]/90" />
      </div>

      {/* Cyber Grid Lines & Floating Tactical Particles */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* 2. Top Game Status Bar */}
      <header className="relative z-20 w-full px-6 md:px-12 py-5 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md bg-[#07090e]/40">
        {/* Brand Callout */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-neon border border-arena-neon/50">
            <Crosshair className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-2xl tracking-wider text-white">
                ARENA<span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-neon to-cyan-400">STRIKE</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-arena-neon/20 border border-arena-neon/40 text-arena-neon font-bold">
                PRO 3D
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block -mt-1">
              TACTICAL ONLINE DEATHMATCH
            </span>
          </div>
        </div>

        {/* Center Live Season Badge */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-300">SEASON 01:</span>
          <span className="text-arena-neon font-bold">CYBER PROTOCOL</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">30HZ AUTHORITATIVE</span>
        </div>

        {/* Right System Controls & Auth */}
        <div className="flex items-center gap-4">
          {/* Server Ping */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">US-EAST:</span>
            <span className="text-emerald-400 font-bold">{serverPing}ms</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
            title={soundEnabled ? 'Mute Game Audio' : 'Unmute Game Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-arena-neon" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Sign In / Sign Up */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleButtonClick(onSignIn)}
              className="px-4 py-2 rounded-xl text-xs font-orbitron font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              SIGN IN
            </button>
            <button
              onClick={() => handleButtonClick(onSignUp)}
              className="px-4 py-2 rounded-xl text-xs font-orbitron font-bold text-black bg-gradient-to-r from-arena-accent to-arena-neon hover:opacity-90 shadow-neon active:scale-95 transition-all"
            >
              REGISTER
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Center Stage (AAA Video Game Menu Layout) */}
      <main className="relative z-10 flex-1 px-6 md:px-12 py-8 max-w-7xl mx-auto w-full flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Game Title & Primary Menu Actions (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-6 space-y-6">
            {/* Tactical Callout Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md bg-arena-neon/15 border-l-2 border-arena-neon text-arena-neon text-xs font-mono uppercase tracking-wider mb-3">
                <Activity className="w-3.5 h-3.5" /> AUTHORITATIVE MULTIPLAYER DEPLOYMENT
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-orbitron font-black uppercase tracking-tight text-white leading-none">
                ARENA<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-neon via-cyan-400 to-blue-500 drop-shadow-[0_0_25px_rgba(0,240,255,0.6)]">
                  STRIKE
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base mt-4 max-w-lg leading-relaxed font-normal">
                Private 8-pilot multiplayer deathmatch. Server-authoritative raycast gunplay, third-person tactical controls, and real-time database-backed rankings.
              </p>
            </div>

            {/* Primary Action Button: DEPLOY COMBAT */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleButtonClick(onPlayNow)}
                className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-arena-accent via-arena-neon to-cyan-400 text-black font-orbitron font-black text-lg tracking-wider shadow-neon hover:shadow-neon-strong hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between sm:justify-start gap-4"
              >
                <div className="w-9 h-9 rounded-xl bg-black text-arena-neon flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">DEPLOY COMBAT</div>
                  <div className="text-[10px] font-mono font-bold tracking-widest text-slate-900 uppercase">
                    INSTANT PLAY • NO INSTALL
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1.5 transition-transform" />
              </button>

              {/* Quick Room Code Input */}
              <form onSubmit={handleQuickJoin} className="flex gap-2 max-w-md pt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
                    placeholder="ENTER 6-CHAR ROOM CODE"
                    className="w-full bg-slate-900/90 border border-slate-700 hover:border-arena-neon/50 focus:border-arena-neon rounded-xl py-3 pl-4 pr-12 text-sm font-orbitron tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-arena-neon backdrop-blur-md transition-all uppercase"
                  />
                  <span className="absolute right-3 top-3.5 text-[10px] font-mono text-slate-500">CODE</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-arena-neon hover:text-white border border-arena-neon/40 hover:border-arena-neon font-orbitron font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>JOIN</span>
                </button>
              </form>
            </div>

            {/* Tactical Game Menu Navigation Bar */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              <button
                onClick={() => handleButtonClick(onPlayNow)}
                className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-orbitron font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
              >
                <Shield className="w-4 h-4 text-arena-neon" />
                <span>Host Squad Room</span>
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={() => handleButtonClick(onOpenLeaderboard)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-orbitron font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Global Rankings</span>
                </button>
              )}

              {onOpenSettings && (
                <button
                  onClick={() => handleButtonClick(onOpenSettings)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-orbitron font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-all active:scale-95"
                >
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Combat Settings</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Tactical Armory & Pilot Intel Card (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col gap-4">
            {/* Interactive Armory Inspection Card */}
            <div className="glass-panel-neon p-6 rounded-3xl border border-slate-700/80 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crosshair className="w-32 h-32 text-arena-neon" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-arena-neon">
                    STANDARD COMBAT WEAPON
                  </span>
                  <h3 className="text-2xl font-orbitron font-extrabold text-white mt-0.5">
                    AR-7 VALKYRIE
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-arena-laser/20 border border-arena-laser/40 text-arena-laser">
                  ASSAULT RIFLE
                </span>
              </div>

              {/* Weapon Stats Telemetry */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Firepower</span>
                    <span className="text-white font-mono font-bold">25 DMG</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-arena-laser h-full w-[70%]" />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Fire Rate</span>
                    <span className="text-white font-mono font-bold">480 RPM</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-arena-neon h-full w-[80%]" />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Magazine</span>
                    <span className="text-white font-mono font-bold">30 / 120</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[65%]" />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Reload Speed</span>
                    <span className="text-white font-mono font-bold">2.0s</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[75%]" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
                <span>Effective Range: 120m</span>
                <span className="text-arena-neon font-bold">Ready for Deployment</span>
              </div>
            </div>

            {/* Combat Controls Cheatsheet */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                CONTROLS REFERENCE
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/80 py-2 px-1 rounded-lg border border-slate-800">
                  <span className="text-arena-neon font-orbitron font-bold block">WASD</span>
                  <span className="text-[10px] text-slate-400">Move</span>
                </div>
                <div className="bg-slate-900/80 py-2 px-1 rounded-lg border border-slate-800">
                  <span className="text-arena-neon font-orbitron font-bold block">MOUSE</span>
                  <span className="text-[10px] text-slate-400">Aim / Look</span>
                </div>
                <div className="bg-slate-900/80 py-2 px-1 rounded-lg border border-slate-800">
                  <span className="text-arena-laser font-orbitron font-bold block">LEFT CLICK</span>
                  <span className="text-[10px] text-slate-400">Shoot</span>
                </div>
                <div className="bg-slate-900/80 py-2 px-1 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-orbitron font-bold block">R / SPACE</span>
                  <span className="text-[10px] text-slate-400">Reload / Jump</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Bottom Tactical Ticker Bar */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-3 border-t border-slate-800/80 bg-[#07090e]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-arena-neon font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-arena-neon animate-pulse" />
            MATCHMAKING ENGINE: ONLINE
          </span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline">MAP: CYBER GRID SECTOR 4</span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline">ROOM CAPACITY: 2-8 PILOTS</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">ARENA STRIKE &copy; 2026</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 hover:text-arena-neon cursor-pointer" onClick={() => handleButtonClick(onPlayNow)}>
            QUICK PLAY &rarr;
          </span>
        </div>
      </footer>
    </div>
  );
};
