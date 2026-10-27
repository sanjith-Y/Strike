import React from 'react';
import { Shirt, Check, Lock, Sparkles, X, ShoppingBag } from 'lucide-react';
import { COSTUMES, getEquippedIds, saveEquippedIds, getOwnedCostumes } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface VaultModalProps {
  onClose: () => void;
  onEquipChange: () => void;
  onOpenStore: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({ onClose, onEquipChange, onOpenStore }) => {
  const owned = getOwnedCostumes();
  const equipped = getEquippedIds();

  const handleEquip = (costumeId: string) => {
    soundSystem.playUIClick();
    saveEquippedIds({
      ...equipped,
      costumeId,
    });
    onEquipChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-4xl max-h-[90vh] rounded-3xl border border-arena-neon/40 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-arena-neon/40 flex items-center justify-center text-arena-neon shadow-neon">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-black text-white flex items-center gap-2">
                PILOT VAULT & WARDROBE
              </h2>
              <p className="text-xs text-slate-400 font-mono">Select and equip your 3D battle suits, armor sets and dresses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenStore}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-orbitron font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Get More Outfits</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Costumes Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {COSTUMES.map((item) => {
            const isOwned = owned.includes(item.id);
            const isEquipped = equipped.costumeId === item.id;

            return (
              <div
                key={item.id}
                className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-arena-neon shadow-neon bg-cyan-950/20'
                    : isOwned
                    ? 'border-slate-800 hover:border-slate-600'
                    : 'border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className={`w-full h-36 rounded-xl bg-gradient-to-tr ${item.iconBg} flex items-center justify-center relative mb-3 shadow-inner`}>
                    <span className="font-orbitron font-black text-white/30 text-4xl">ARMOR</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/60 text-white font-bold">
                      {item.rarity}
                    </span>
                    {isEquipped && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-orbitron font-bold bg-arena-neon text-black">
                        EQUIPPED ON STAGE
                      </span>
                    )}
                  </div>

                  <h3 className="font-orbitron font-bold text-white text-base mb-1">{item.name}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: `#${item.armorColor.toString(16).padStart(6, '0')}` }} title="Armor Hue" />
                    <span className="w-4 h-4 rounded-full border border-white/40 shadow-neon" style={{ backgroundColor: `#${item.glowColor.toString(16).padStart(6, '0')}` }} title="Energy Glow" />
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-arena-neon/20 border border-arena-neon text-arena-neon text-xs font-orbitron font-black flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(item.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-arena-accent to-arena-neon hover:opacity-90 text-black text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
                    >
                      <span>EQUIP DRESS</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenStore}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-orbitron font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>UNLOCK IN STORE</span>
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
