import React from 'react';
import { Crosshair, Check, Lock, X, ShoppingBag, Zap, Shield, Target } from 'lucide-react';
import { WEAPONS, getEquippedIds, saveEquippedIds, getOwnedWeapons } from '../services/catalog';
import { soundSystem } from '../services/audio';

interface WeaponModalProps {
  onClose: () => void;
  onEquipChange: () => void;
  onOpenStore: () => void;
}

export const WeaponModal: React.FC<WeaponModalProps> = ({ onClose, onEquipChange, onOpenStore }) => {
  const owned = getOwnedWeapons();
  const equipped = getEquippedIds();

  const handleEquip = (weaponId: string) => {
    soundSystem.playReloadSound();
    saveEquippedIds({
      ...equipped,
      weaponId,
    });
    onEquipChange();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="glass-panel-neon w-full max-w-4xl max-h-[90vh] rounded-3xl border border-arena-laser/40 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-arena-laser/40 flex items-center justify-center text-arena-laser shadow-laser">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-black text-white flex items-center gap-2">
                TACTICAL WEAPONS ARMORY
              </h2>
              <p className="text-xs text-slate-400 font-mono">Assault Rifles, SMGs, Shotguns and Snipers with authoritative combat stats</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenStore}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-orbitron font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Get More Guns</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Weapons Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {WEAPONS.map((gun) => {
            const isOwned = owned.includes(gun.id);
            const isEquipped = equipped.weaponId === gun.id;

            return (
              <div
                key={gun.id}
                className={`glass-panel p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEquipped
                    ? 'border-arena-laser shadow-laser bg-red-950/20'
                    : isOwned
                    ? 'border-slate-800 hover:border-slate-600'
                    : 'border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center relative mb-3">
                    <span className="font-orbitron font-black text-white/30 text-4xl">{gun.category}</span>
                    <span className="text-xs font-orbitron text-arena-neon font-bold mt-1">{gun.name}</span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-black/60 text-white font-bold">
                      {gun.rarity}
                    </span>
                    {isEquipped && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-orbitron font-bold bg-arena-laser text-white">
                        EQUIPPED IN HAND
                      </span>
                    )}
                  </div>

                  <h3 className="font-orbitron font-bold text-white text-base mb-2">{gun.name}</h3>

                  {/* Telemetry Progress Bars */}
                  <div className="space-y-2 mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono">
                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Damage</span>
                        <span className="text-white font-bold">{gun.damage} HP</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-arena-laser h-full" style={{ width: `${Math.min(100, (gun.damage / 100) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 mb-0.5">
                        <span>Rate of Fire</span>
                        <span className="text-white font-bold">{gun.fireRate} RPM</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-arena-neon h-full" style={{ width: `${Math.min(100, (gun.fireRate / 800) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/80">
                      <span>Mag: <b className="text-white">{gun.magazineCapacity}</b></span>
                      <span>Range: <b className="text-white">{gun.range}m</b></span>
                      <span>Reload: <b className="text-white">{(gun.reloadDurationMs / 1000).toFixed(1)}s</b></span>
                    </div>
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-arena-laser/20 border border-arena-laser text-arena-laser text-xs font-orbitron font-black flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> CURRENTLY EQUIPPED
                    </div>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(gun.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-arena-laser to-rose-600 hover:opacity-90 text-white text-xs font-orbitron font-bold flex items-center justify-center gap-2 shadow-laser active:scale-95 transition-all"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>EQUIP GUN</span>
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
