import { CharacterItem, CostumeItem, WeaponItem } from '../types';

// ============================================================
// 10 EXACT FREE FIRE CHARACTERS (From Reference Image 1)
// ============================================================
export const CHARACTERS: CharacterItem[] = [
  {
    id: 'kelly',
    name: 'KELLY',
    title: 'The Swift Sprinter',
    ability: 'Dash',
    abilityDesc: 'Sprint speed is increased by 18% allowing lightning-fast repositioning across the arena.',
    armorColor: 0xfacc15, // Iconic Yellow Tracksuit
    glowColor: 0xffe600,
    priceCoins: 0,
    priceDiamonds: 0,
    owned: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces',
  },
  {
    id: 'hayato',
    name: 'HAYATO',
    title: 'Legendary Samurai',
    ability: 'Bushido',
    abilityDesc: 'When maximum HP drops by 10%, bullet armor penetration increases by 12%.',
    armorColor: 0x3b0764, // Dark Samurai Vest
    glowColor: 0xec4899,
    priceCoins: 1200,
    priceDiamonds: 100,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=faces',
  },
  {
    id: 'dasha',
    name: 'DASHA',
    title: 'Punk Rock Prankster',
    ability: 'Partying On',
    abilityDesc: 'Reduces recoil buildup by 10% and cuts damage taken from falling by 50%.',
    armorColor: 0xdb2777, // Pink Beanie & Flame Crop
    glowColor: 0x06b6d4,
    priceCoins: 1500,
    priceDiamonds: 120,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&crop=faces',
  },
  {
    id: 'laura',
    name: 'LAURA',
    title: 'Special Agent',
    ability: 'Sharp Shooter',
    abilityDesc: 'Accuracy increases by 35% while aiming down sights or using weapon scopes.',
    armorColor: 0x1e3a8a, // Special Ops Navy Beret
    glowColor: 0x38bdf8,
    priceCoins: 1100,
    priceDiamonds: 90,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&fit=crop&crop=faces',
  },
  {
    id: 'paloma',
    name: 'PALOMA',
    title: 'Arms Commander',
    ability: 'Arms-Dealing',
    abilityDesc: 'Carries up to 180 AR rifle ammunition without occupying backpack inventory space.',
    armorColor: 0x365314, // Green Officer Uniform
    glowColor: 0xeab308,
    priceCoins: 1000,
    priceDiamonds: 80,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop&crop=faces',
  },
  {
    id: 'maxim',
    name: 'MAXIM',
    title: 'Speedy Foodie',
    ability: 'Gluttony',
    abilityDesc: 'Uses medkits and eats energy mushrooms 25% faster in the heat of combat.',
    armorColor: 0xb91c1c, // Red Hoodie & Leather Jacket
    glowColor: 0xf97316,
    priceCoins: 800,
    priceDiamonds: 60,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=faces',
  },
  {
    id: 'kla',
    name: 'KLA',
    title: 'Muay Thai Legend',
    ability: 'Muay Thai',
    abilityDesc: 'Fist and melee striking damage is increased by 400% for brutal close-quarters knockouts.',
    armorColor: 0x78350f, // Bare-chested Muay Thai
    glowColor: 0xd97706,
    priceCoins: 750,
    priceDiamonds: 50,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&fit=crop&crop=faces',
  },
  {
    id: 'miguel',
    name: 'MIGUEL',
    title: 'Special Forces Leader',
    ability: 'Crazy Slayer',
    abilityDesc: 'Gain 80 EP (Energy Points) for each enemy elimination to continuously heal health.',
    armorColor: 0x1f2937, // Commando Beret & Camo
    glowColor: 0x10b981,
    priceCoins: 900,
    priceDiamonds: 70,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&fit=crop&crop=faces',
  },
  {
    id: 'misha',
    name: 'MISHA',
    title: 'Grand Prix Champion',
    ability: 'Afterburner',
    abilityDesc: 'Vehicle driving speed increased by 20% while damage taken inside vehicles is reduced by 30%.',
    armorColor: 0xea580c, // Racing Cap & Yellow Scarf
    glowColor: 0xfacc15,
    priceCoins: 650,
    priceDiamonds: 40,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&crop=faces',
  },
  {
    id: 'nikita',
    name: 'NIKITA',
    title: 'Professional Bodyguard',
    ability: 'Firearms Expert',
    abilityDesc: 'Submachine Gun (SMG) reload speed is increased by 24% for continuous bullet pressure.',
    armorColor: 0x111827, // Glasses & Tactical Corset
    glowColor: 0x9333ea,
    priceCoins: 600,
    priceDiamonds: 40,
    owned: false,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&fit=crop&crop=faces',
  },
];

// ============================================================
// ICONIC FREE FIRE ELITE PASS BUNDLES (From Reference Image 2)
// ============================================================
export const COSTUMES: CostumeItem[] = [
  {
    id: 's2_hiphop',
    name: 'S2: Hip Hop Master',
    category: 'bundle',
    rarity: 'legendary',
    armorColor: 0xdb2777, // Iconic Pink Hip Hop Hoodie
    glowColor: 0xfacc15, // Golden Chains & Cap
    accentColor: 0x1e293b,
    headStyle: 'helmet',
    torsoStyle: 'vest',
    priceCoins: 0,
    priceDiamonds: 0,
    owned: true,
    iconBg: 'from-pink-600 via-rose-500 to-amber-400',
  },
  {
    id: 's1_sakura',
    name: 'S1: Sakura Festival',
    category: 'bundle',
    rarity: 'legendary',
    armorColor: 0x9333ea, // Purple/Pink Kimono
    glowColor: 0xf43f5e,
    accentColor: 0xfbcfe8,
    headStyle: 'crown',
    torsoStyle: 'ninja',
    priceCoins: 2500,
    priceDiamonds: 250,
    owned: false,
    iconBg: 'from-purple-600 to-pink-500',
  },
  {
    id: 's10_anubis',
    name: 'S10: Anubis Legend',
    category: 'bundle',
    rarity: 'legendary',
    armorColor: 0xd4af37, // Egyptian Gold Sovereign
    glowColor: 0xffeb3b,
    accentColor: 0x1e1e1e,
    headStyle: 'cyber_horns',
    torsoStyle: 'mecha',
    priceCoins: 2000,
    priceDiamonds: 200,
    owned: false,
    iconBg: 'from-amber-600 via-yellow-500 to-amber-700',
  },
  {
    id: 's17_skull_hunter',
    name: 'S17: Demon Skull Hunter',
    category: 'bundle',
    rarity: 'mythic',
    armorColor: 0x18181b, // Spiked Bone Demon Armor
    glowColor: 0xdc2626, // Blood Crimson
    accentColor: 0xf43f5e,
    headStyle: 'helmet',
    torsoStyle: 'heavy',
    priceCoins: 1800,
    priceDiamonds: 160,
    owned: false,
    iconBg: 'from-red-700 to-stone-900',
  },
  {
    id: 's20_cyber_blade',
    name: 'S20: Cyber Blade Ronin',
    category: 'bundle',
    rarity: 'epic',
    armorColor: 0x4c1d95, // Holographic Purple Jacket
    glowColor: 0x06b6d4, // Cyan Lasers
    accentColor: 0x22d3ee,
    headStyle: 'visor',
    torsoStyle: 'vest',
    priceCoins: 1400,
    priceDiamonds: 120,
    owned: false,
    iconBg: 'from-violet-600 to-cyan-500',
  },
  {
    id: 's24_kitsune',
    name: 'S24: Kitsune Fox Spirit',
    category: 'bundle',
    rarity: 'legendary',
    armorColor: 0xfef08a, // Gold & White Fox Garb
    glowColor: 0xf59e0b,
    accentColor: 0xd97706,
    headStyle: 'cyber_horns',
    torsoStyle: 'ninja',
    priceCoins: 2200,
    priceDiamonds: 220,
    owned: false,
    iconBg: 'from-yellow-500 to-orange-600',
  },
  {
    id: 's3_doomsday',
    name: 'S3: Doomsday Raider',
    category: 'bundle',
    rarity: 'rare',
    armorColor: 0x57534e, // Post-Apocalyptic Rusted Steel
    glowColor: 0xea580c,
    accentColor: 0x78716c,
    headStyle: 'helmet',
    torsoStyle: 'heavy',
    priceCoins: 900,
    priceDiamonds: 80,
    owned: false,
    iconBg: 'from-orange-700 to-stone-800',
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
    glowColor: 0xfbbf24,
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
    bodyColor: 0xd97706,
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
  return ['kelly'];
}

export function getOwnedCostumes(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'owned_costumes');
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['s2_hiphop'];
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
  return { characterId: 'kelly', costumeId: 's2_hiphop', weaponId: 'ar7_valkyrie' };
}

export function saveEquippedIds(equipped: { characterId: string; costumeId: string; weaponId: string }) {
  localStorage.setItem(STORAGE_PREFIX + 'equipped', JSON.stringify(equipped));
}

export function getWallet(): { coins: number; diamonds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + 'wallet');
    if (raw) return JSON.parse(raw);
  } catch {}
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
