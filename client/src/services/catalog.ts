import { CharacterItem, CostumeItem, WeaponItem } from '../types';

// ============================================================
// CHARACTERS CATALOG
// ============================================================
export const CHARACTERS: CharacterItem[] = [
  {
    id: 'kronos',
    name: 'KRONOS',
    title: 'Golden Cyber Mech',
    ability: 'Titan Armor',
    abilityDesc: 'Reduces damage taken from bullets by 10% and boosts recoil recovery.',
    armorColor: 0xd4af37, // Metallic Gold
    glowColor: 0xffd700,
    priceCoins: 0,
    priceDiamonds: 0,
    owned: true,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=KronosGold',
  },
  {
    id: 'alok',
    name: 'DJ ALOK',
    title: 'Sound Maestro',
    ability: 'Drop The Beat',
    abilityDesc: 'Creates a 5m aura that increases ally movement speed by 15% and regenerates 3HP/s.',
    armorColor: 0x1e293b,
    glowColor: 0x00f0ff,
    priceCoins: 1200,
    priceDiamonds: 100,
    owned: false,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DJAlok',
  },
  {
    id: 'kelly',
    name: 'KELLY',
    title: 'Swift Dash',
    ability: 'Fatal Velocity',
    abilityDesc: 'Increases sprint speed by 18% and reduces stamina depletion.',
    armorColor: 0xffa500,
    glowColor: 0xff4500,
    priceCoins: 800,
    priceDiamonds: 80,
    owned: false,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=KellyFast',
  },
  {
    id: 'chrono',
    name: 'CHRONO',
    title: 'Time Warden',
    ability: 'Time Turner',
    abilityDesc: 'Deploys a stationary spherical force field that blocks incoming enemy fire.',
    armorColor: 0x3b82f6,
    glowColor: 0x60a5fa,
    priceCoins: 1800,
    priceDiamonds: 150,
    owned: false,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChronoTime',
  },
  {
    id: 'hayato',
    name: 'HAYATO',
    title: 'Bushido Legacy',
    ability: 'Bushido Edge',
    abilityDesc: 'When health is lower than 50%, bullet armor penetration increases by 20%.',
    armorColor: 0x881337,
    glowColor: 0xf43f5e,
    priceCoins: 1500,
    priceDiamonds: 120,
    owned: false,
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=HayatoBlade',
  },
];

// ============================================================
// COSTUMES / DRESS COLLECTIONS (VAULT)
// ============================================================
export const COSTUMES: CostumeItem[] = [
  {
    id: 'golden_mecha',
    name: 'Gold Mecha Sovereign',
    category: 'bundle',
    rarity: 'legendary',
    armorColor: 0xd4af37, // Rich metallic gold like the Free Fire screenshot
    glowColor: 0xffeb3b,
    accentColor: 0x1a1a1a,
    headStyle: 'cyber_horns',
    torsoStyle: 'mecha',
    priceCoins: 0,
    priceDiamonds: 0,
    owned: true,
    iconBg: 'from-amber-600 to-yellow-400',
  },
  {
    id: 'shadow_ninja',
    name: 'Shadow Wraith Shinobi',
    category: 'bundle',
    rarity: 'mythic',
    armorColor: 0x0f172a, // Obsidian Black
    glowColor: 0xff0055, // Crimson Laser
    accentColor: 0x991b1b,
    headStyle: 'helmet',
    torsoStyle: 'ninja',
    priceCoins: 1600,
    priceDiamonds: 120,
    owned: false,
    iconBg: 'from-red-600 to-rose-950',
  },
  {
    id: 'cryo_commando',
    name: 'Arctic Cryo Soldier',
    category: 'bundle',
    rarity: 'epic',
    armorColor: 0xe2e8f0, // Frost White
    glowColor: 0x00f0ff, // Ice Cyan
    accentColor: 0x0284c7,
    headStyle: 'visor',
    torsoStyle: 'heavy',
    priceCoins: 1100,
    priceDiamonds: 90,
    owned: false,
    iconBg: 'from-cyan-600 to-blue-900',
  },
  {
    id: 'tokyo_neon',
    name: 'Neo-Tokyo Street Fighter',
    category: 'bundle',
    rarity: 'epic',
    armorColor: 0x581c87, // Cyber Purple
    glowColor: 0xd946ef, // Hot Magenta
    accentColor: 0xec4899,
    headStyle: 'crown',
    torsoStyle: 'vest',
    priceCoins: 950,
    priceDiamonds: 75,
    owned: false,
    iconBg: 'from-purple-600 to-pink-500',
  },
  {
    id: 'titan_warlord',
    name: 'Titanium Exoskeleton',
    category: 'bundle',
    rarity: 'rare',
    armorColor: 0x475569, // Military Gunmetal
    glowColor: 0xf97316, // Blaze Orange
    accentColor: 0xc2410c,
    headStyle: 'helmet',
    torsoStyle: 'heavy',
    priceCoins: 600,
    priceDiamonds: 50,
    owned: false,
    iconBg: 'from-orange-600 to-slate-800',
  },
];

// ============================================================
// WEAPONS ARMORY
// ============================================================
export const WEAPONS: WeaponItem[] = [
  {
    id: 'ar7_valkyrie',
    name: 'AR-7 Valkyrie',
    category: 'AR',
    rarity: 'rare',
    damage: 25,
    fireRate: 480,
    fireRateMs: 125,
    magazineCapacity: 30,
    maxReserveAmmo: 120,
    reloadDurationMs: 2000,
    range: 120,
    bodyColor: 0x1e293b,
    glowColor: 0x00f0ff,
    barrelLength: 0.5,
    priceCoins: 0,
    priceDiamonds: 0,
    owned: true,
  },
  {
    id: 'ak47_dragon',
    name: 'AK-47 Flame Dragon',
    category: 'AR',
    rarity: 'legendary',
    damage: 34,
    fireRate: 420,
    fireRateMs: 142,
    magazineCapacity: 30,
    maxReserveAmmo: 120,
    reloadDurationMs: 2200,
    range: 140,
    bodyColor: 0x7f1d1d,
    glowColor: 0xfbbf24, // Gold Dragon Flame
    barrelLength: 0.58,
    priceCoins: 1500,
    priceDiamonds: 120,
    owned: false,
  },
  {
    id: 'm4a1_cyber',
    name: 'M4A1 Neon Grid',
    category: 'AR',
    rarity: 'epic',
    damage: 28,
    fireRate: 520,
    fireRateMs: 115,
    magazineCapacity: 30,
    maxReserveAmmo: 150,
    reloadDurationMs: 1900,
    range: 130,
    bodyColor: 0x0f172a,
    glowColor: 0x00f0ff,
    barrelLength: 0.52,
    priceCoins: 1000,
    priceDiamonds: 80,
    owned: false,
  },
  {
    id: 'mp40_cobra',
    name: 'MP40 Cobra Predator',
    category: 'SMG',
    rarity: 'legendary',
    damage: 18,
    fireRate: 750,
    fireRateMs: 80,
    magazineCapacity: 32,
    maxReserveAmmo: 180,
    reloadDurationMs: 1600,
    range: 75,
    bodyColor: 0xd97706, // Golden Cobra Yellow
    glowColor: 0xf59e0b,
    barrelLength: 0.38,
    priceCoins: 1750,
    priceDiamonds: 140,
    owned: false,
  },
  {
    id: 'm1887_thunder',
    name: 'M1887 Thunder Shotgun',
    category: 'Shotgun',
    rarity: 'mythic' as any,
    damage: 75,
    fireRate: 150,
    fireRateMs: 400,
    magazineCapacity: 2,
    maxReserveAmmo: 40,
    reloadDurationMs: 1800,
    range: 45,
    bodyColor: 0x111827,
    glowColor: 0xef4444,
    barrelLength: 0.44,
    priceCoins: 2000,
    priceDiamonds: 160,
    owned: false,
  },
  {
    id: 'awm_glacier',
    name: 'AWM Arctic Sniper',
    category: 'Sniper',
    rarity: 'legendary',
    damage: 95,
    fireRate: 45,
    fireRateMs: 1200,
    magazineCapacity: 5,
    maxReserveAmmo: 30,
    reloadDurationMs: 2800,
    range: 220,
    bodyColor: 0x0369a1,
    glowColor: 0x38bdf8,
    barrelLength: 0.75,
    priceCoins: 2200,
    priceDiamonds: 180,
    owned: false,
  },
];

// ============================================================
// LOCAL STORAGE KEYS & INVENTORY PERSISTENCE
// ============================================================
const STORAGE_PREFIX = 'arena_strike_';

export function getOwnedCharacters(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'owned_chars');
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['kronos'];
}

export function getOwnedCostumes(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'owned_costumes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['golden_mecha'];
}

export function getOwnedWeapons(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'owned_weapons');
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['ar7_valkyrie'];
}

export function getEquippedIds(): { characterId: string; costumeId: string; weaponId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'equipped');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { characterId: 'kronos', costumeId: 'golden_mecha', weaponId: 'ar7_valkyrie' };
}

export function saveEquippedIds(equipped: { characterId: string; costumeId: string; weaponId: string }) {
  localStorage.setItem(STORAGE_PREFIX + 'equipped', JSON.stringify(equipped));
}

export function getWallet(): { coins: number; diamonds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'wallet');
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default starting purse: 2,450 Gold Coins, 350 Diamonds
  const initial = { coins: 2450, diamonds: 350 };
  localStorage.setItem(STORAGE_PREFIX + 'wallet', JSON.stringify(initial));
  return initial;
}

export function saveWallet(wallet: { coins: number; diamonds: number }) {
  localStorage.setItem(STORAGE_PREFIX + 'wallet', JSON.stringify(wallet));
}

export function addCoins(amount: number): { coins: number; diamonds: number } {
  const current = getWallet();
  current.coins += amount;
  saveWallet(current);
  return current;
}

export function deductFunds(coins: number, diamonds: number = 0): boolean {
  const current = getWallet();
  if (current.coins < coins || current.diamonds < diamonds) return false;
  current.coins -= coins;
  current.diamonds -= diamonds;
  saveWallet(current);
  return true;
}

export function unlockItem(type: 'character' | 'costume' | 'weapon', itemId: string): boolean {
  if (type === 'character') {
    const list = getOwnedCharacters();
    if (!list.includes(itemId)) {
      list.push(itemId);
      localStorage.setItem(STORAGE_PREFIX + 'owned_chars', JSON.stringify(list));
      return true;
    }
  } else if (type === 'costume') {
    const list = getOwnedCostumes();
    if (!list.includes(itemId)) {
      list.push(itemId);
      localStorage.setItem(STORAGE_PREFIX + 'owned_costumes', JSON.stringify(list));
      return true;
    }
  } else if (type === 'weapon') {
    const list = getOwnedWeapons();
    if (!list.includes(itemId)) {
      list.push(itemId);
      localStorage.setItem(STORAGE_PREFIX + 'owned_weapons', JSON.stringify(list));
      return true;
    }
  }
  return false;
}
