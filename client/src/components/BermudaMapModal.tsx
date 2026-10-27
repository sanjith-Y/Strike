import React, { useState } from 'react';
import { X, MapPin, Compass, Shield, Crosshair, AlertTriangle, Radio } from 'lucide-react';
import { soundSystem } from '../services/audio';

interface BermudaMapModalProps {
  onClose: () => void;
  playerPos?: { x: number; z: number };
}

interface LocationHotspot {
  name: string;
  tier: 'High' | 'Medium' | 'Low';
  desc: string;
  topPct: number;
  leftPct: number;
}

const BERMUDA_HOTSPOTS: LocationHotspot[] = [
  { name: 'PEAK', tier: 'High', desc: 'Central plateau mountain with highest combat density & Tier 3 loot.', topPct: 42, leftPct: 46 },
  { name: 'CLOCK TOWER', tier: 'High', desc: 'Historic stone clocktower square, sniper perches & tight street alleys.', topPct: 45, leftPct: 62 },
  { name: 'BIMASAKTI STRIP', tier: 'High', desc: 'Long airstrip runway flanked by hangars and high-grade armor drops.', topPct: 56, leftPct: 51 },
  { name: 'FACTORY', tier: 'High', desc: 'Multi-level industrial plant renowned for rooftop fist-fights and shotgun brawls.', topPct: 68, leftPct: 42 },
  { name: 'POCHINOK', tier: 'Medium', desc: 'Dense suburban township with residential buildings and abundant medkits.', topPct: 68, leftPct: 67 },
  { name: 'SENTOSA', tier: 'Medium', desc: 'Isolated tropical resort island connected by twin long-span suspension bridges.', topPct: 79, leftPct: 88 },
  { name: 'HANGAR', tier: 'Medium', desc: 'Aircraft shelters with runways and tactical cover crates.', topPct: 44, leftPct: 26 },
  { name: 'SHIPYARD', tier: 'High', desc: 'Container cranes, cargo vessels and shipping crate labyrinths.', topPct: 15, leftPct: 49 },
  { name: 'MARS ELECTRIC', tier: 'Medium', desc: 'Nuclear cooling towers and industrial switchyards with rare sniper rifles.', topPct: 32, leftPct: 65 },
  { name: 'OBSERVATORY', tier: 'Medium', desc: 'Hilltop telescope dome with sweeping panoramic lines of sight.', topPct: 83, leftPct: 52 },
  { name: 'CAPE TOWN', tier: 'Low', desc: 'Coastal hillside village with steady early-game provisions.', topPct: 33, leftPct: 15 },
  { name: 'PLANTATION', tier: 'Low', desc: 'Fertile agricultural fields and green farmhouses.', topPct: 73, leftPct: 24 },
  { name: 'WATERFRONT', tier: 'Medium', desc: 'Harbor warehouses and docking piers on the northeastern shore.', topPct: 24, leftPct: 74 },
  { name: 'BULLSEYE', tier: 'Medium', desc: 'Military shooting ranges with firing barricades and ammunition boxes.', topPct: 19, leftPct: 27 },
];

export const BermudaMapModal: React.FC<BermudaMapModalProps> = ({ onClose, playerPos }) => {
  const [selectedHotspot, setSelectedHotspot] = useState<LocationHotspot | null>(BERMUDA_HOTSPOTS[0]);
  const [waypoint, setWaypoint] = useState<{ xPct: number; yPct: number } | null>({ xPct: 46, yPct: 42 });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setWaypoint({ xPct, yPct });
    soundSystem.playUIClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none font-inter animate-fade-in">
      <div className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#0c1017] border-2 border-arena-neon/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header Bar */}
        <div className="h-14 px-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-arena-neon/20 border border-arena-neon/50 flex items-center justify-center text-arena-neon shadow-neon">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-orbitron font-black text-white flex items-center gap-2">
                BERMUDA ISLAND <span className="text-xs font-mono font-bold text-arena-neon px-2 py-0.5 rounded bg-cyan-950/80 border border-arena-neon/40">BATTLE ROYALE</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Tactical Radar Chart • Grid 1-8 / A-J • Safe Zone Active</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {waypoint && (
              <span className="hidden md:inline-flex text-xs font-mono text-amber-400 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/40 items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                WAYPOINT: {waypoint.xPct}% E, {waypoint.yPct}% S
              </span>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Map Viewport + Tactical Legend Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Map Image with Grid & Interactive Waypoints */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden p-2 sm:p-4">
            <div
              onClick={handleMapClick}
              className="relative w-full max-w-[620px] aspect-square rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl cursor-crosshair group"
            >
              {/* Reference 5 Bermuda Radar Map Image */}
              <img
                src="/assets/bermuda_map.jpg"
                alt="Bermuda Battle Royale Radar Map"
                className="w-full h-full object-cover"
              />

              {/* Safe Zone Ring (White Free Fire Outer Circle) */}
              <div
                className="absolute rounded-full border-2 border-white/70 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                style={{
                  top: '15%',
                  left: '15%',
                  width: '70%',
                  height: '70%',
                }}
              />

              {/* Electric Blue Storm Boundary */}
              <div
                className="absolute rounded-full border-2 border-cyan-400/90 pointer-events-none animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                style={{
                  top: '10%',
                  left: '10%',
                  width: '80%',
                  height: '80%',
                }}
              />

              {/* Waypoint Marker */}
              {waypoint && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-30 transition-all duration-200"
                  style={{ top: `${waypoint.yPct}%`, left: `${waypoint.xPct}%` }}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-orbitron font-bold text-amber-300 bg-black/85 px-1.5 py-0.5 rounded shadow border border-amber-400/60 whitespace-nowrap">
                      DROP PING
                    </span>
                    <MapPin className="w-7 h-7 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-bounce" />
                  </div>
                </div>
              )}

              {/* Hotspot Markers */}
              {BERMUDA_HOTSPOTS.map((spot) => {
                const isSelected = selectedHotspot?.name === spot.name;
                return (
                  <button
                    key={spot.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(spot);
                      setWaypoint({ xPct: spot.leftPct, yPct: spot.topPct });
                      soundSystem.playUIClick();
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full transition-all duration-150 z-20 ${
                      isSelected
                        ? 'bg-amber-400 text-black scale-125 shadow-[0_0_12px_rgba(250,204,21,1)]'
                        : 'bg-black/75 hover:bg-black text-white hover:scale-110 border border-white/50'
                    }`}
                    style={{ top: `${spot.topPct}%`, left: `${spot.leftPct}%` }}
                    title={spot.name}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Tactical Sidebar */}
          <div className="w-full md:w-80 bg-[#0e121b] border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-orbitron font-black text-slate-200 tracking-wider">
                  TACTICAL DROP ZONES
                </h3>
              </div>

              {selectedHotspot && (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 mb-4 shadow-inner">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-orbitron font-black text-amber-400 text-base">{selectedHotspot.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        selectedHotspot.tier === 'High'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : selectedHotspot.tier === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {selectedHotspot.tier} Loot
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedHotspot.desc}</p>
                </div>
              )}

              {/* Hotspots Quick List */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {BERMUDA_HOTSPOTS.map((spot) => (
                  <button
                    key={spot.name}
                    onClick={() => {
                      setSelectedHotspot(spot);
                      setWaypoint({ xPct: spot.leftPct, yPct: spot.topPct });
                      soundSystem.playUIClick();
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-orbitron flex items-center justify-between transition-all ${
                      selectedHotspot?.name === spot.name
                        ? 'bg-amber-400 text-black font-black shadow-md'
                        : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span>{spot.name}</span>
                    <span className={`text-[10px] font-mono font-bold ${selectedHotspot?.name === spot.name ? 'text-black' : 'text-slate-400'}`}>
                      {spot.tier}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  soundSystem.playMatchStartSound();
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-arena-neon to-cyan-400 hover:brightness-110 text-slate-950 font-orbitron font-black text-xs flex items-center justify-center gap-2 shadow-neon active:scale-95 transition-all"
              >
                <span>CONFIRM DROP POINT & RETURN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
