import React, { useState } from 'react';
import { Check, Lock, X, Zap, Shield, Heart, Award, Sparkles, Coins, Gem, Crosshair, ChevronRight } from 'lucide-react';
import { CHARACTERS, getEquippedIds, saveEquippedIds, getOwnedCharacters, getWallet } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface CharacterModalProps {
  onClose: () => void;
  onEquipChange: () => void;
  onOpenStore: () => void;
}

// 10 Free Fire Characters in exact layout from Reference Image 1:
// Row 1: Dasha, Kelly, Hayato, Laura, Paloma
// Row 2: Maxim, Kla, Miguel, Misha, Nikita
const ROSTER_ORDER = ['dasha', 'kelly', 'hayato', 'laura', 'paloma', 'maxim', 'kla', 'miguel', 'misha', 'nikita'];

// Free Fire character avatar artwork portraits (high quality dedicated character portraits)
const CHARACTER_ART: Record<string, { artUrl: string; level: number; skillColor: string; bgGradient: string }> = {
  dasha: {
    artUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=360&auto=format&fit=crop&q=80',
    level: 4,
    skillColor: '#ec4899',
    bgGradient: 'from-pink-900/60 via-slate-900 to-black',
  },
  kelly: {
    artUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&auto=format&fit=crop&q=80',
    level: 6,
    skillColor: '#eab308',
    bgGradient: 'from-amber-900/60 via-slate-900 to-black',
  },
  hayato: {
    artUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=360&auto=format&fit=crop&q=80',
    level: 4,
    skillColor: '#ef4444',
    bgGradient: 'from-red-950/60 via-slate-900 to-black',
  },
  laura: {
    artUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=360&auto=format&fit=crop&q=80',
    level: 4,
    skillColor: '#38bdf8',
    bgGradient: 'from-blue-950/60 via-slate-900 to-black',
  },
  paloma: {
    artUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=360&auto=format&fit=crop&q=80',
    level: 6,
    skillColor: '#f97316',
    bgGradient: 'from-orange-950/60 via-slate-900 to-black',
  },
  maxim: {
    artUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=360&auto=format&fit=crop&q=80',
    level: 6,
    skillColor: '#f59e0b',
    bgGradient: 'from-yellow-950/60 via-slate-900 to-black',
  },
  kla: {
    artUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=360&auto=format&fit=crop&q=80',
    level: 1,
    skillColor: '#dc2626',
    bgGradient: 'from-rose-950/60 via-slate-900 to-black',
  },
  miguel: {
    artUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=360&auto=format&fit=crop&q=80',
    level: 4,
    skillColor: '#10b981',
    bgGradient: 'from-emerald-950/60 via-slate-900 to-black',
  },
  misha: {
    artUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=360&auto=format&fit=crop&q=80',
    level: 1,
    skillColor: '#facc15',
    bgGradient: 'from-amber-950/60 via-slate-900 to-black',
  },
  nikita: {
    artUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=360&auto=format&fit=crop&q=80',
    level: 1,
    skillColor: '#a855f7',
    bgGradient: 'from-purple-950/60 via-slate-900 to-black',
  },
};

export const CharacterModal: React.FC<CharacterModalProps> = ({ onClose, onEquipChange, onOpenStore }) => {
  const owned = getOwnedCharacters();
  const equipped = getEquippedIds();
  const wallet = getWallet();

  // Highlighted character preview (defaults to currently equipped)
  const [selectedCharId, setSelectedCharId] = useState<string>(equipped.characterId || 'maxim');

  const orderedCharacters = ROSTER_ORDER.map((id) => {
    return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
  });

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharId) || orderedCharacters[0];
  const activeCharArt = CHARACTER_ART[selectedCharId] || { level: 4, skillColor: '#eab308' };

  const handleSelect = (characterId: string) => {
    setSelectedCharId(characterId);
    soundSystem.playUIClick();
    // Equip immediately if owned, otherwise just preview
    if (owned.includes(characterId)) {
      saveEquippedIds({
        ...equipped,
        characterId,
      });
      onEquipChange();
    }
  };

  const handleEquipButton = () => {
    soundSystem.playUIClick();
    saveEquippedIds({
      ...equipped,
      characterId: selectedCharId,
    });
    onEquipChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 md:p-6 select-none font-inter animate-fade-in">
      <div className="w-full max-w-6xl h-[92vh] max-h-[820px] bg-[#10131a] border border-[#2b3548] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Top Free Fire Header Bar matching Reference 1 */}
        <div className="h-14 px-4 bg-gradient-to-r from-[#171d28] via-[#10141d] to-[#1a1520] border-b border-[#2a3446] flex items-center justify-between shrink-0">
          {/* Left Player Profile Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0c0f16]/90 px-2.5 py-1 rounded-lg border border-[#37445c]">
              <div className="w-7 h-7 rounded bg-red-600 border border-amber-400 flex items-center justify-center font-orbitron font-black text-xs text-white">
                {activeCharArt.level}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-orbitron font-black text-white leading-tight">KKillerKlown</span>
                <span className="text-[10px] text-pink-400 font-mono leading-tight">♡ Delibeth ♡</span>
              </div>
            </div>

            {/* Currency Badges */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#0b0e15] px-2.5 py-1 rounded border border-[#2e3b52]">
                <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-[10px]">
                  C
                </div>
                <span className="text-xs font-orbitron font-bold text-amber-300">{wallet.coins}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#0b0e15] px-2.5 py-1 rounded border border-[#2e3b52]">
                <Gem className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-orbitron font-bold text-cyan-300">{wallet.diamonds}</span>
              </div>
            </div>
          </div>

          {/* Right Section: Title and Red Close Button */}
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-orbitron font-black tracking-widest text-slate-100 uppercase drop-shadow">
              CHARACTER
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              title="Close"
            >
              <X className="w-5 h-5 font-bold" />
            </button>
          </div>
        </div>

        {/* 2x5 Character Cards Grid (Exact Free Fire Layout from Image 1) */}
        <div className="flex-1 p-3 md:p-6 overflow-y-auto flex flex-col justify-between">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 md:gap-4">
            {orderedCharacters.map((char) => {
              const art = CHARACTER_ART[char.id] || { level: 4, skillColor: '#eab308', bgGradient: 'from-slate-900 to-black' };
              const isSelected = selectedCharId === char.id;
              const isEquipped = equipped.characterId === char.id;
              const isOwned = owned.includes(char.id);

              return (
                <div
                  key={char.id}
                  onClick={() => handleSelect(char.id)}
                  className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-150 transform hover:-translate-y-0.5 aspect-[3/4] flex flex-col justify-between ${
                    isSelected
                      ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#0d1017] shadow-[0_0_20px_rgba(250,204,21,0.5)] border-2 border-yellow-300'
                      : isEquipped
                      ? 'border-2 border-amber-500/70'
                      : 'border border-[#283244] hover:border-slate-500'
                  }`}
                >
                  {/* Character Portrait Background */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${art.bgGradient}`}>
                    <img
                      src={art.artUrl}
                      alt={char.name}
                      className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  </div>

                  {/* Right Edge: 4 Skill Slots Diamonds (from Reference Image 1) */}
                  <div className="absolute top-2 right-1.5 flex flex-col items-center gap-1.5 z-10">
                    {/* Slot 1: Unlocked Active Skill Diamond */}
                    <div
                      className="w-7 h-7 rotate-45 border border-white/60 flex items-center justify-center shadow-md relative"
                      style={{ backgroundColor: art.skillColor }}
                      title={`${char.ability} (Skill Lv. ${art.level})`}
                    >
                      <div className="-rotate-45 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="absolute -bottom-2 -left-2 -rotate-45 text-[8px] font-mono font-bold text-white bg-black/80 px-1 rounded">
                        Lv.{art.level}
                      </span>
                    </div>

                    {/* Slot 2: Locked Skill Diamond */}
                    <div className="w-5 h-5 rotate-45 bg-[#171e2c]/90 border border-slate-600/70 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-slate-400 -rotate-45" />
                    </div>

                    {/* Slot 3: Locked Skill Diamond */}
                    <div className="w-5 h-5 rotate-45 bg-[#171e2c]/90 border border-slate-600/70 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-slate-400 -rotate-45" />
                    </div>

                    {/* Slot 4: Locked Skill Diamond */}
                    <div className="w-5 h-5 rotate-45 bg-[#171e2c]/90 border border-slate-600/70 flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 text-slate-400 -rotate-45" />
                    </div>
                  </div>

                  {/* Top Left: Equipped Indicator if currently deployed */}
                  <div className="relative z-10 p-2">
                    {isEquipped && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black font-orbitron font-black text-[9px] shadow">
                        DEPLOYED
                      </span>
                    )}
                  </div>

                  {/* Bottom White Label Nameplate (Exact Free Fire Image 1 Style) */}
                  <div className="relative z-10 bg-white/95 px-2.5 py-1 flex items-center justify-between border-t border-slate-300">
                    <span className="font-orbitron font-extrabold text-xs md:text-sm text-slate-900 tracking-wide uppercase">
                      {char.name}
                    </span>
                    {!isOwned && (
                      <span className="text-[10px] font-mono font-bold text-amber-700 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Prompt from Image 1: "Select your character" */}
          <div className="mt-3 text-center">
            <h3 className="text-base md:text-lg font-orbitron font-bold text-slate-300 tracking-wider">
              Select your character
            </h3>
          </div>
        </div>

        {/* Selected Character Skill & Action Footer */}
        <div className="h-20 px-6 bg-[#0a0d14] border-t border-[#232c3d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rotate-45 border border-amber-400 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: activeCharArt.skillColor }}
            >
              <Zap className="w-5 h-5 text-white -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-black text-white text-base">{activeChar.name}</span>
                <span className="text-xs font-orbitron font-bold text-amber-400">
                  {activeChar.ability} (Lv. {activeCharArt.level})
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl line-clamp-1">{activeChar.abilityDesc}</p>
            </div>
          </div>

          <div>
            {equipped.characterId === selectedCharId ? (
              <div className="px-6 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-400 font-orbitron font-black text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
              </div>
            ) : owned.includes(selectedCharId) ? (
              <button
                onClick={handleEquipButton}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-orbitron font-black text-xs flex items-center gap-2 shadow-neon active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" /> EQUIP CHARACTER
              </button>
            ) : (
              <button
                onClick={onOpenStore}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white font-orbitron font-black text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Coins className="w-4 h-4 text-amber-300" />
                <span>UNLOCK ({activeChar.priceCoins} COINS)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
