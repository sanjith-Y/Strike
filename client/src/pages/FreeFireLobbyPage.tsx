import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  User,
  Shirt,
  Crosshair,
  Trophy,
  Users,
  Settings,
  Plus,
  Coins,
  Gem,
  Play,
  Volume2,
  VolumeX,
  Share2,
  Cat,
  Flame,
  Award,
  ChevronRight,
  Shield,
  Target,
  LogOut,
  MapPin,
  Map as MapIcon,
} from 'lucide-react';
import { Lobby3DStage } from '../game/Lobby3DStage';
import { StoreModal } from '../components/StoreModal';
import { VaultModal } from '../components/VaultModal';
import { WeaponModal } from '../components/WeaponModal';
import { CharacterModal } from '../components/CharacterModal';
import { LuckRoyaleModal } from '../components/LuckRoyaleModal';
import { ModeModal } from '../components/ModeModal';
import { TeamCodeModal } from '../components/TeamCodeModal';
import { BermudaMapModal } from '../components/BermudaMapModal';
import { getEquippedIds, getWallet, saveWallet, addCoins } from '../services/catalog';
import { soundSystem } from '../services/audio';
import { GameModeType, TeamModeType, UserProfile } from '../types';

interface FreeFireLobbyPageProps {
  user: UserProfile;
  onStartMatch: (mode: GameModeType, team: TeamModeType) => void;
  onJoinByCode: (code: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const FreeFireLobbyPage: React.FC<FreeFireLobbyPageProps> = ({
  user,
  onStartMatch,
  onJoinByCode,
  onOpenSettings,
  onLogout,
}) => {
  // Equipped Loadout
  const [equipped, setEquipped] = useState(getEquippedIds());
  const [wallet, setWallet] = useState(getWallet());

  // Modals state
  const [showStore, setShowStore] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showWeapons, setShowWeapons] = useState(false);
  const [showCharacters, setShowCharacters] = useState(false);
  const [showLuckRoyale, setShowLuckRoyale] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showTeamCode, setShowTeamCode] = useState(false);
  const [showBermudaMap, setShowBermudaMap] = useState(false);

  // Game & Team Selection
  const [gameMode, setGameMode] = useState<GameModeType>('BR_RANKED');
  const [teamMode, setTeamMode] = useState<TeamModeType>('SOLO');
  const [isMatching, setIsMatching] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // My persistent Fast Team Code
  const [myTeamCode] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  });

  const refreshInventory = () => {
    setEquipped(getEquippedIds());
    setWallet(getWallet());
  };

  const handleStart = () => {
    soundSystem.playMatchStartSound();
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      onStartMatch(gameMode, teamMode);
    }, 1200);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundSystem.setVolumes(next ? 0.8 : 0, next ? 0.5 : 0);
  };

  const getModeLabel = () => {
    switch (gameMode) {
      case 'BR_RANKED': return 'RANKED GAME (BR)';
      case 'CS_RANKED': return 'CLASH SQUAD RANKED';
      case 'TRAINING': return 'TRAINING GROUNDS';
      default: return 'BATTLE ROYALE CASUAL';
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#07090e] overflow-hidden select-none font-inter text-slate-100 flex flex-col justify-between">
      {/* 0. Military Cargo Hangar Backdrop (Exact Free Fire Reference Image 4) */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
        style={{ backgroundImage: "url('/assets/hangar_lobby.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>

      {/* 1. Live Interactive 3D Character Stage (360° Drag & Rotate) */}
      <Lobby3DStage
        username={user.username}
        costumeId={equipped.costumeId}
        weaponId={equipped.weaponId}
        characterId={equipped.characterId || 'maxim'}
      />

      {/* 2. Top Header Navigation (Free Fire Style) */}
      <header className="relative z-20 w-full px-4 md:px-8 py-3 flex items-center justify-between pointer-events-none">
        {/* Left: Player Profile Card */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2 pr-4 rounded-2xl border border-slate-800/80 backdrop-blur-md pointer-events-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-amber-400 overflow-hidden flex items-center justify-center shadow-neon">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold text-sm text-white tracking-wide">{user.username}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                Lv.48
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="text-amber-400 font-bold">💎 2K ARMY</span>
              <span>•</span>
              <span className="text-emerald-400">👍 187</span>
            </div>
          </div>
        </div>

        {/* Center: Currency Display (Gold Coins & Diamonds) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Gold Coins */}
          <div className="flex items-center gap-2 bg-slate-950/85 px-3.5 py-1.5 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-neon">
              <Coins className="w-4 h-4 font-bold" />
            </div>
            <span className="font-orbitron font-bold text-sm text-amber-400">{wallet.coins.toLocaleString()}</span>
            <button
              onClick={() => { addCoins(500); refreshInventory(); soundSystem.playKillSound(); }}
              className="w-5 h-5 rounded-md bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
              title="Add 500 Free Coins"
            >
              +
            </button>
          </div>

          {/* Diamonds */}
          <div className="flex items-center gap-2 bg-slate-950/85 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-md shadow-inner">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 shadow-neon">
              <Gem className="w-4 h-4" />
            </div>
            <span className="font-orbitron font-bold text-sm text-cyan-400">{wallet.diamonds.toLocaleString()}</span>
            <button
              onClick={() => { soundSystem.playUIClick(); setShowStore(true); }}
              className="w-5 h-5 rounded-md bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-300 flex items-center justify-center text-xs font-bold active:scale-95 transition-all"
              title="Diamond Store"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Sound, Settings, Logout */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95"
            title="Toggle Sound"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-arena-neon" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all active:scale-95"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-all active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Middle Interactive HUD (Left Free Fire Sidebar + Right Mode Selector) */}
      <div className="relative z-20 flex-1 px-4 md:px-8 py-2 flex justify-between items-center pointer-events-none">
        {/* Left Vertical Menu: STORE, LUCK ROYALE, CHARACTER, VAULT, WEAPONS */}
        <div className="flex flex-col gap-2.5 pointer-events-auto">
          {/* STORE */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowStore(true); }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-yellow-500/90 text-black font-orbitron font-extrabold text-xs tracking-wider shadow-neon hover:scale-105 active:scale-95 transition-all w-40 border border-yellow-300/40"
          >
            <ShoppingBag className="w-5 h-5 fill-current" />
            <span>STORE</span>
          </button>

          {/* LUCK ROYALE */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowLuckRoyale(true); }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/90 to-pink-500/90 text-white font-orbitron font-extrabold text-xs tracking-wider shadow-laser hover:scale-105 active:scale-95 transition-all w-40 border border-pink-400/40"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>LUCK ROYALE</span>
          </button>

          {/* CHARACTER */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowCharacters(true); }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-white font-orbitron font-bold text-xs tracking-wider hover:scale-105 active:scale-95 transition-all w-40"
          >
            <User className="w-5 h-5 text-amber-400" />
            <span>CHARACTER</span>
          </button>

          {/* VAULT / DRESS COLLECTIONS */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowVault(true); }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-arena-neon/50 text-white font-orbitron font-bold text-xs tracking-wider hover:scale-105 active:scale-95 transition-all w-40"
          >
            <Shirt className="w-5 h-5 text-arena-neon" />
            <span>VAULT</span>
          </button>

          {/* WEAPONS ARMORY */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowWeapons(true); }}
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-arena-laser/50 text-white font-orbitron font-bold text-xs tracking-wider hover:scale-105 active:scale-95 transition-all w-40"
          >
            <Crosshair className="w-5 h-5 text-arena-laser" />
            <span>WEAPONS</span>
          </button>
        </div>

        {/* Right Section: Mode Selector Card, Team Mode, and Fast Team Code */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Season / Rank Tier Card */}
          <div className="bg-slate-950/85 p-3 rounded-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-neon">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">TIER RANKING</div>
              <div className="font-orbitron font-black text-amber-400 text-sm">DIAMOND III</div>
            </div>
          </div>

          {/* Mode Selector Card (Click to open ModeModal) */}
          <div
            onClick={() => setShowModeModal(true)}
            className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border-2 border-arena-neon/50 hover:border-arena-neon cursor-pointer shadow-neon backdrop-blur-md w-64 transition-all hover:scale-[1.02] active:scale-95"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                +20% EXP • RANDOM MAP
              </span>
              <ChevronRight className="w-4 h-4 text-arena-neon" />
            </div>
            <h3 className="text-xl font-orbitron font-black text-white uppercase tracking-wide">
              {getModeLabel()}
            </h3>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
              <span className="text-amber-400 font-bold">{teamMode}</span>
              <span>•</span>
              <span>SECTOR 4 ARENA</span>
            </div>
          </div>

          {/* Fast Team Code Button */}
          <button
            onClick={() => setShowTeamCode(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-white border border-slate-700 hover:border-arena-neon/50 font-orbitron font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Users className="w-4 h-4 text-arena-neon" />
            <span>INVITE / FAST TEAM CODE</span>
          </button>

          {/* Tactical Bermuda Map Button */}
          <button
            onClick={() => { soundSystem.playUIClick(); setShowBermudaMap(true); }}
            className="px-4 py-2.5 rounded-2xl bg-cyan-950/80 hover:bg-cyan-900/90 text-arena-neon border border-arena-neon/50 hover:border-arena-neon font-orbitron font-bold text-xs flex items-center justify-between active:scale-95 transition-all shadow-neon"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-arena-neon animate-pulse" />
              <span>BERMUDA RADAR MAP</span>
            </span>
            <span className="text-[10px] font-mono bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">GRID A-J</span>
          </button>
        </div>
      </div>

      {/* 4. Bottom Free Fire Style Golden START Button */}
      <footer className="relative z-20 w-full px-4 md:px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* World / Chat Placeholder */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 pointer-events-auto text-xs font-mono text-slate-400">
          <span className="text-arena-neon font-bold">[WORLD]</span>
          <span>Pilot {user.username} ready for Sector 4 drop...</span>
        </div>

        {/* Free Fire Iconic Angled START Button */}
        <div className="ml-auto pointer-events-auto">
          <button
            onClick={handleStart}
            disabled={isMatching}
            className={`group relative px-16 py-5 rounded-2xl font-orbitron font-black text-2xl tracking-widest text-black shadow-neon transition-all flex items-center gap-3 overflow-hidden ${
              isMatching
                ? 'bg-amber-300 animate-pulse'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 hover:scale-105 active:scale-95'
            }`}
            style={{
              clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
            }}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>{isMatching ? 'MATCHING...' : 'START'}</span>
          </button>
        </div>
      </footer>

      {/* 5. Modals */}
      {showStore && (
        <StoreModal
          onClose={() => setShowStore(false)}
          onUpdateInventory={refreshInventory}
          wallet={wallet}
        />
      )}

      {showVault && (
        <VaultModal
          onClose={() => setShowVault(false)}
          onEquipChange={refreshInventory}
          onOpenStore={() => { setShowVault(false); setShowStore(true); }}
        />
      )}

      {showWeapons && (
        <WeaponModal
          onClose={() => setShowWeapons(false)}
          onEquipChange={refreshInventory}
          onOpenStore={() => { setShowWeapons(false); setShowStore(true); }}
        />
      )}

      {showCharacters && (
        <CharacterModal
          onClose={() => setShowCharacters(false)}
          onEquipChange={refreshInventory}
          onOpenStore={() => { setShowCharacters(false); setShowStore(true); }}
        />
      )}

      {showLuckRoyale && (
        <LuckRoyaleModal
          onClose={() => setShowLuckRoyale(false)}
          onUpdateInventory={refreshInventory}
          wallet={wallet}
        />
      )}

      {showModeModal && (
        <ModeModal
          currentMode={gameMode}
          currentTeam={teamMode}
          onSelectMode={(m) => setGameMode(m)}
          onSelectTeam={(t) => setTeamMode(t)}
          onClose={() => setShowModeModal(false)}
        />
      )}

      {showTeamCode && (
        <TeamCodeModal
          myTeamCode={myTeamCode}
          onJoinByCode={onJoinByCode}
          onClose={() => setShowTeamCode(false)}
        />
      )}

      {showBermudaMap && (
        <BermudaMapModal
          onClose={() => setShowBermudaMap(false)}
        />
      )}
    </div>
  );
};
