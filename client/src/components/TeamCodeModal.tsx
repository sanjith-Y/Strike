import React, { useState } from 'react';
import { Users, Copy, Check, ArrowRight, X } from 'lucide-react';
import { soundSystem } from '../services/audio';

interface TeamCodeModalProps {
  myTeamCode: string;
  onJoinByCode: (code: string) => void;
  onClose: () => void;
}

export const TeamCodeModal: React.FC<TeamCodeModalProps> = ({ myTeamCode, onJoinByCode, onClose }) => {
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(myTeamCode);
    setCopied(true);
    soundSystem.playUIClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = codeInput.trim().toUpperCase();
    if (clean.length >= 4) {
      soundSystem.playUIClick();
      onJoinByCode(clean);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-md rounded-3xl border border-arena-neon/50 p-6 flex flex-col shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-arena-neon/50 flex items-center justify-center text-arena-neon shadow-neon mb-3">
          <Users className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-orbitron font-black text-white">FAST TEAM CODE</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">Squad up instantly with friends using a 6-digit code</p>

        {/* My Team Code Box */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700/80 mb-6 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
            YOUR SQUAD TEAM CODE
          </span>
          <div className="text-3xl font-orbitron font-black text-arena-neon tracking-widest mb-3">
            {myTeamCode}
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-600 flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'CODE COPIED!' : 'COPY TEAM CODE'}</span>
          </button>
        </div>

        {/* Enter Friend's Code */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-orbitron text-slate-300 mb-2">
              JOIN FRIEND'S TEAM CODE
            </label>
            <input
              type="text"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. 7X4K29"
              className="w-full text-center text-2xl font-orbitron tracking-widest bg-slate-900 border-2 border-slate-700 focus:border-arena-neon rounded-2xl py-3 text-white uppercase focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-arena-accent to-arena-neon text-black font-orbitron font-bold text-sm shadow-neon flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>JOIN SQUAD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
