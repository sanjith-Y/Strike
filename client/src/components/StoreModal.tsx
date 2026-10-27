import React, { useState } from 'react';
import { ShoppingBag, Coins, Gem, Check, Lock, Sparkles, X } from 'lucide-react';
import { CHARACTERS, COSTUMES, WEAPONS, unlockItem, deductFunds, getWallet, getOwnedCharacters, getOwnedCostumes, getOwnedWeapons } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface StoreModalProps {
  onClose: () => void;
  onUpdateInventory: () => void;
  wallet: { coins: number; diamonds: number };
}

export const StoreModal: React.FC<StoreModalProps> = ({ onClose, onUpdateInventory, wallet }) => {
  const [activeTab, setActiveTab] = useState<'bundles' | 'characters' | 'weapons'>('bundles');
  const [feedback, setFeedback] = useState<string | null>(null);

  const ownedChars = getOwnedCharacters();
  const ownedCostumes = getOwnedCostumes();
  const ownedWeapons = getOwnedWeapons();

  const handleBuy = (type: 'character' | 'costume' | 'weapon', id: string, coins: number, diamonds: number, name: string) => {
    soundSystem.playUIClick();
    if (wallet.coins < coins) {
      setFeedback(`Insufficient coins! Need ${coins} Gold Coins.`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    const success = deductFunds(coins, 0);
    if (success) {
      unlockItem(type, id);
      soundSystem.playKillSound(); // Triumph fanfare
      setFeedback(`Unlocked: ${name}! Equipped to Vault.`);
      onUpdateInventory();
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-4xl max-h-[90vh] rounded-3xl border border-amber-500/40 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-neon">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-black text-white flex items-center gap-2">
                ARMORY & VAULT STORE
              </h2>
              <p className="text-xs text-slate-400 font-mono">Unlock exclusive costumes, operators, and legendary firearms</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Wallet pill */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 font-mono text-sm">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Coins className="w-4 h-4" />
                <span>{wallet.coins.toLocaleString()}</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Gem className="w-4 h-4" />
                <span>{wallet.diamonds.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-4 bg-slate-950/50 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'bundles'
                ? 'bg-amber-500 text-black shadow-neon'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Costumes & Dresses
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'weapons'
                ? 'bg-amber-500 text-black shadow-neon'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Legendary Guns
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-6 py-2.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider transition-all ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-black shadow-neon'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Characters & Heroes
          </button>
        </div>

        {/* Alerts */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Store Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {activeTab === 'bundles' &&
            COSTUMES.map((item) => {
              const isOwned = ownedCostumes.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-full h-32 rounded-xl bg-gradient-to-tr ${item.iconBg} flex items-center justify-center relative mb-3 shadow-inner overflow-hidden`}>
                      <span className="font-orbitron font-black text-white/40 text-4xl">OUTFIT</span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/60 text-white font-bold">
                        {item.rarity}
                      </span>
                    </div>
                    <h3 className="font-orbitron font-bold text-white text-base mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">Complete 3D Battle Royale outfit bundle with custom helmet, pauldrons and boots.</p>
                  </div>

                  <div>
                    {isOwned ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> OWNED IN VAULT
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy('costume', item.id, item.priceCoins, item.priceDiamonds, item.name)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
                      >
                        <Coins className="w-4 h-4" />
                        <span>BUY FOR {item.priceCoins.toLocaleString()} COINS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'weapons' &&
            WEAPONS.map((gun) => {
              const isOwned = ownedWeapons.includes(gun.id);
              return (
                <div
                  key={gun.id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col items-center justify-center relative mb-3">
                      <span className="font-orbitron font-black text-white/30 text-3xl">{gun.category}</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold mt-1">{gun.name}</span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/60 text-white font-bold">
                        {gun.rarity}
                      </span>
                    </div>
                    <h3 className="font-orbitron font-bold text-white text-base mb-1">{gun.name}</h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-400 mb-4 bg-slate-950 p-2 rounded-lg">
                      <div>DMG: <span className="text-white font-bold">{gun.damage}</span></div>
                      <div>RPM: <span className="text-white font-bold">{gun.fireRate}</span></div>
                      <div>MAG: <span className="text-white font-bold">{gun.magazineCapacity}</span></div>
                      <div>RNG: <span className="text-white font-bold">{gun.range}m</span></div>
                    </div>
                  </div>

                  <div>
                    {isOwned ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> OWNED IN ARMORY
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy('weapon', gun.id, gun.priceCoins, gun.priceDiamonds, gun.name)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
                      >
                        <Coins className="w-4 h-4" />
                        <span>BUY FOR {gun.priceCoins.toLocaleString()} COINS</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {activeTab === 'characters' &&
            CHARACTERS.map((char) => {
              const isOwned = ownedChars.includes(char.id);
              return (
                <div
                  key={char.id}
                  className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative mb-3 overflow-hidden">
                      <img src={char.avatarUrl} alt={char.name} className="w-20 h-20 object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-amber-400 font-bold">
                        {char.title}
                      </span>
                    </div>
                    <h3 className="font-orbitron font-bold text-white text-base mb-1">{char.name}</h3>
                    <p className="text-xs text-amber-300 font-mono font-bold mb-1">Ability: {char.ability}</p>
                    <p className="text-[11px] text-slate-400 mb-4">{char.abilityDesc}</p>
                  </div>

                  <div>
                    {isOwned ? (
                      <div className="w-full py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-orbitron font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> RECRUITED
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy('character', char.id, char.priceCoins, char.priceDiamonds, char.name)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
                      >
                        <Coins className="w-4 h-4" />
                        <span>RECRUIT ({char.priceCoins.toLocaleString()} COINS)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
