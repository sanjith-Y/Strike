import React from 'react';
import { User, Check, Lock, X, ShoppingBag, Shield, Zap, Heart, ShieldAlert } from 'lucide-react';
import { CHARACTERS, getEquippedIds, saveEquippedIds, getOwnedCharacters } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface CharacterModalProps {
  onClose: () => void;
  onEquipChange: () => void;
  onOpenStore: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ onClose, onEquipChange, onOpenStore }) => {
  const owned = getOwnedCharacters();
  const equipped = getEquippedIds();

  const handleEquip = (characterId: string) => {
    soundSystem.playUIClick();
    saveEquippedIds({
      ...equipped,
      characterId,
    });
    onEquipChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-4xl max-h-[90vh] rounded-3xl border border-amber-500/40 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-neon">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-black text-white flex items-center gap-2">
                OPERATOR ROSTER (CHARACTERS)
              </h2>
              <p className="text-xs text-slate-400 font-mono">Select your battle specialist and leverage game-changing tactical abilities</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenStore}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-orbitron font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Recruit More</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {CHARACTERS.map((char) => {
            const isOwned = owned.includes(char.id);
            const isEquipped = equipped.characterId === char.id;

            return (
              <div
                key={char.id}
                className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-amber-400 shadow-neon bg-amber-950/20'
                    : isOwned
                    ? 'border-slate-800 hover:border-slate-600'
                    : 'border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className="w-full h-36 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative mb-3 overflow-hidden">
                    <img src={char.avatarUrl} alt={char.name} className="w-24 h-24 object-cover" />
                    <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded text-[10px] font-mono bg-black/75 text-amber-400 font-bold">
                      {char.title}
                    </span>
                    {isEquipped && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-orbitron font-bold bg-amber-400 text-black">
                        DEPLOYED
                      </span>
                    )}
                  </div>

                  <h3 className="font-orbitron font-bold text-white text-lg mb-1">{char.name}</h3>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-bold mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{char.ability}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{char.abilityDesc}</p>
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-400 text-xs font-orbitron font-black flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> CURRENTLY DEPLOYED
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(char.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-90 text-black text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>EQUIP OPERATOR</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenStore}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-orbitron font-semibold flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>RECRUIT IN STORE</span>
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
