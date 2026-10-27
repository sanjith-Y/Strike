import React, { useState } from 'react';
import { Sparkles, Coins, Gem, X, Trophy, Gift } from 'lucide-react';
import { deductFunds, addCoins, saveWallet, getWallet } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface LuckRoyaleModalProps {
  onClose: () => void;
  onUpdateInventory: () => void;
  wallet: { coins: number; diamonds: number };
}

const PRIZES = [
  { name: '500 Gold Coins', type: 'coins', amount: 500, color: 'text-amber-400' },
  { name: '100 Gold Coins', type: 'coins', amount: 100, color: 'text-yellow-300' },
  { name: '50 Diamonds', type: 'diamonds', amount: 50, color: 'text-cyan-400' },
  { name: '250 Gold Coins', type: 'coins', amount: 250, color: 'text-amber-400' },
  { name: '750 Gold Coins (MEGA)', type: 'coins', amount: 750, color: 'text-yellow-400' },
  { name: '1,000 Gold Jackpot!', type: 'coins', amount: 1000, color: 'text-amber-300' },
];

export const LuckRoyaleModal: React.FC<LuckRoyaleModalProps> = ({ onClose, onUpdateInventory, wallet }) => {
  const [spinning, setSpinning] = useState(false);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    if (wallet.coins < 100) {
      setRewardMsg('Need 100 Gold Coins to spin!');
      setTimeout(() => setRewardMsg(null), 2500);
      return;
    }

    soundSystem.playUIClick();
    deductFunds(100, 0);
    onUpdateInventory();
    setSpinning(true);
    setRewardMsg(null);

    // Spin animation for 1.8 seconds
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % PRIZES.length;
      setWinningIndex(currentIndex);
      soundSystem.playHitSound();
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      const chosen = Math.floor(Math.random() * PRIZES.length);
      setWinningIndex(chosen);
      setSpinning(false);

      const prize = PRIZES[chosen];
      if (prize.type === 'coins') {
        addCoins(prize.amount);
      } else {
        const cur = getWallet();
        cur.diamonds += prize.amount;
        saveWallet(cur);
      }

      soundSystem.playKillSound();
      setRewardMsg(`🎉 CONGRATULATIONS! You won ${prize.name}!`);
      onUpdateInventory();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-xl rounded-3xl border border-yellow-500/50 p-6 flex flex-col items-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-yellow-400 shadow-neon mb-3">
          <Sparkles className="w-7 h-7 animate-spin-slow" />
        </div>

        <h2 className="text-2xl font-orbitron font-black text-white text-center">
          LUCK ROYALE GOLD SPIN
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6 text-center">
          Test your battle fortune! Spin for Gold Coins, Diamonds, and rare Vault items
        </p>

        {/* Prize Wheel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
          {PRIZES.map((prize, idx) => {
            const isSelected = winningIndex === idx;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/30 border-amber-400 shadow-neon scale-105'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <Gift className={`w-6 h-6 mx-auto mb-1 ${prize.color}`} />
                <span className={`block font-orbitron font-bold text-xs ${prize.color}`}>
                  {prize.name}
                </span>
              </div>
            );
          })}
        </div>

        {rewardMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-orbitron font-bold text-center animate-bounce-subtle">
            {rewardMsg}
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full py-4 rounded-2xl font-orbitron font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-neon transition-all ${
            spinning
              ? 'bg-slate-850 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:scale-[1.02] active:scale-95'
          }`}
        >
          <Coins className="w-5 h-5" />
          <span>{spinning ? 'SPINNING THE ROYALE...' : 'SPIN FOR 100 COINS'}</span>
        </button>
      </div>
    </div>
  );
};
