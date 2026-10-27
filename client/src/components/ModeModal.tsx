import React from 'react';
import { Trophy, Swords, Target, Crosshair, Users, User, Shield, Check, X } from 'lucide-react';
import { GameModeType, TeamModeType } from '../types';
import { soundSystem } from '../services/audio';

interface ModeModalProps {
  currentMode: GameModeType;
  currentTeam: TeamModeType;
  onSelectMode: (mode: GameModeType) => void;
  onSelectTeam: (team: TeamModeType) => void;
  onClose: () => void;
}

export const ModeModal: React.FC<ModeModalProps> = ({
  currentMode,
  currentTeam,
  onSelectMode,
  onSelectTeam,
  onClose,
}) => {
  const modes: { id: GameModeType; name: string; tag: string; desc: string; icon: any; color: string; bg: string }[] = [
    {
      id: 'BR_RANKED',
      name: 'BR-RANKED',
      tag: 'RANKED MATCH',
      desc: 'Survival 8-Pilot Deathmatch. Earn Rank Points (RP) to climb to Grandmaster!',
      icon: Trophy,
      color: 'text-amber-400',
      bg: 'from-amber-600/30 to-slate-900',
    },
    {
      id: 'CS_RANKED',
      name: 'CS-RANKED',
      tag: 'CLASH SQUAD',
      desc: 'Tactical 4v4 close-quarters combat. Team coordination and cover strategy.',
      icon: Swords,
      color: 'text-arena-laser',
      bg: 'from-rose-600/30 to-slate-900',
    },
    {
      id: 'TRAINING',
      name: 'TRAINING GROUNDS',
      tag: 'SOLO TARGET PRACTICE',
      desc: 'Practice range with interactive target dummies, hit counters, and weapon testing.',
      icon: Target,
      color: 'text-emerald-400',
      bg: 'from-emerald-600/30 to-slate-900',
    },
    {
      id: 'CLASSIC_BR',
      name: 'BATTLE ROYALE',
      tag: 'CASUAL MATCH',
      desc: 'Standard unranked arena combat. Warm up your reflexes and earn Gold Coins.',
      icon: Crosshair,
      color: 'text-arena-neon',
      bg: 'from-cyan-600/30 to-slate-900',
    },
  ];

  const handleSelectMode = (m: GameModeType) => {
    soundSystem.playUIClick();
    onSelectMode(m);
  };

  const handleSelectTeam = (t: TeamModeType) => {
    soundSystem.playUIClick();
    onSelectTeam(t);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-3xl rounded-3xl border border-arena-neon/50 p-6 flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h2 className="text-2xl font-orbitron font-black text-white">SELECT COMBAT MODE</h2>
            <p className="text-xs text-slate-400 font-mono">Ranked, Clash Squad, and Target Training</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Mode Selector (Solo / Duo / Squad) */}
        <div className="mb-6">
          <span className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
            TEAM CAPACITY
          </span>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'SOLO' as TeamModeType, label: 'SOLO (1P)', icon: User },
              { id: 'DUO' as TeamModeType, label: 'DUO (2P)', icon: Users },
              { id: 'SQUAD' as TeamModeType, label: 'SQUAD (4P)', icon: Shield },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTeam(t.id)}
                className={`py-3 rounded-2xl font-orbitron font-bold text-xs uppercase flex items-center justify-center gap-2 border transition-all ${
                  currentTeam === t.id
                    ? 'bg-gradient-to-r from-arena-accent to-arena-neon text-black border-arena-neon shadow-neon'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modes Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {modes.map((m) => {
            const isSelected = currentMode === m.id;
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => handleSelectMode(m.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between bg-gradient-to-tr ${m.bg} ${
                  isSelected
                    ? 'border-arena-neon shadow-neon scale-[1.02] bg-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300 font-bold uppercase">
                      {m.tag}
                    </span>
                    {isSelected && <Check className="w-5 h-5 text-arena-neon" />}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-6 h-6 ${m.color}`} />
                    <h3 className="font-orbitron font-extrabold text-white text-lg">{m.name}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-arena-accent to-arena-neon text-black font-orbitron font-bold text-sm shadow-neon active:scale-95 transition-all"
        >
          CONFIRM MODE SELECTION
        </button>
      </div>
    </div>
  );
};
