# ARENA STRIKE: GAME DESIGN DOCUMENT & TECHNICAL SPECIFICATION
**Version:** 1.0.0-PROD  
**Target Platforms:** iOS & Android (Cross-Play)  
**Engine:** Unity 6 LTS / Unreal Engine 5.4 Mobile Pipeline  
**Target Performance:** 60 FPS Stable (Low-Tier Android: Snapdragon 680 / 3GB RAM; Mid/High: 90/120 FPS on Snapdragon 8 Gen 2 / Apple A15+)  
**Genre:** Hybrid Tactical & Hero Battle Royale / Clash Squad Shooter  

---

## 1. CORE GAME MODES

### A) Battle Royale (BR)
* **Player Count:** 50 Players (Solo, Duo, Squad of 4).
* **Match Variants:**
  * **Standard Tactical BR (25 min):** 8x8 km and 4x4 km maps, classic tactical pace, realistic ballistics, slower circle closures, higher strategic depth.
  * **Fast BR (12 min):** Fast drops on 2x2 km maps or restricted zones of 4x4 km maps; 2.5x zone shrink speeds, pre-loaded Tier-1 armor, higher vehicle and loot spawn multipliers.
* **Infiltration & Flight:** High-altitude stealth transport airship with 360° jump trajectory choice, controllable wingsuit glide, manual parachute deployment, and smoke trail customizers.
* **Circle & Zone Mechanics:**
  * **Safe Zone:** 6 shrinking phases with progressive DPS (Phase 1: 1.5 HP/s -> Phase 6: 12 HP/s).
  * **Electric Boundary:** Visual distortion and mini-map jammer when caught outside.
  * **Red Bombardment Zone:** Dynamic artillery strikes targeting high-player-density outdoor sectors.
  * **Air Drop Crates:** Standard high-tier weapon drops + golden flare-gun summoned "Mega Crates" containing prototype heavy weapons and Level 4 experimental armor.
* **Knockdown, Revive & Respawn Systems:**
  * **Knocked-Down State:** 100 Bleedout HP, crawl speed 1.5 m/s, ping capability, self-revive kit support (consumes in 7s).
  * **Squad Revive:** 8.0s standard interaction (reduced by character passives down to 5.5s).
  * **Respawn Heart Beacons:** Teammates collect dog tags/bio-cores within 90s of death and transmit at fixed Beacon Terminals (15s broadcast, emits high-visibility flare beacon). Respawning players drop in with Tier-1 pistol and basic vest.
* **Killcam & Spectate:** Real-time 5-second kill replay, death spectate with free-cam perspective among squadmates, and post-game 3D timeline breakdown.

### B) Clash Squad (CS) — 4v4 Round-Based Tactical
* **Format:** Best-of-7 rounds (First to 4 wins).
* **Economy System:**
  * Round 1 starting cash: $500.
  * Win Round: +$1,500 | Loss Round: +$1,100 (+$200 loss streak bonus up to 3 rounds).
  * Kill Reward: +$300 | Bomb Plant/Defuse: +$400.
* **Round Flow:** 15s buy phase with perimeter energy walls, 2-minute round duration, Safe Zone collapses at the 60s mark to prevent camping and force decisive CQB clashes.
* **Tactical Utilities:** Deployable Gloo Barricades, smoke grenades, flashbangs, flash shields, and med-injectors purchasable directly from the buy terminal.

### C) Proving Grounds (Training Ground)
* **Shooting Range:** Target dummies from 10m to 300m with real-time digital hit displays (Head, Torso, Limbs) and DPS meters.
* **Recoil Mastery Wall:** Laser-traced bullet impact boards recording spray groupings for every gun and attachment combo.
* **Obstacle & Parkour Course:** Timed mantle, vault, slide, and climb challenges.
* **Vehicle Test Track:** Off-road, ramps, drift curves, and tire-spike obstacle tests.
* **AI Bot Duel Pit:** 1v1 to 1v4 configurable bot combat with adjustable difficulty (Recruit, Veteran, Esports Pro).

### D) Limited-Time & Arcade Modes
* **Team Deathmatch (TDM 5v5):** 10-minute limit, first to 40 kills, instant respawns with chosen loadout.
* **Arena Duel 1v1:** Pure aim skill arena on symmetric platforms, identical loadouts, best of 5 rounds.
* **Gun Game:** 18 weapon tiers, 1 kill advances weapon, melee kill demotes enemy, final kill via Combat Throwing Knife.
* **Zombie Outbreak:** 4-player co-op survival against waves of mutants and mutant bosses on night-time maps with barricade construction and weapon upgrade shrines.

---

## 2. MAPS SPECIFICATION

| Map Name | Dimensions | Biome & Atmosphere | Hot-Drop Zones | High-Ground Positions | Vehicle Density | Weather & Day/Night Variants |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Solaris Isle** | 8x8 km (64 km²) | Temperate archipelago with metropolitan hubs, industrial shipyards, dense pine forests, military radar bases, and coastal marshland. | Sector 0 Central Citadel, Naval Shipyard, Novaya Military Base | Mount Solaris Peak (420m), Central Communications Array Tower, Suspension Bridge Girders | High (Jeeps, Buggies, Sports Cars, Speedboats) | Clear Noon, Overcast Fog, Sunset Glow, Night Ops (IR/Night-Vision equipped) |
| **Frostline** | 4x4 km (16 km²) | Sub-arctic tundra, frozen deep-water lake, subterranean research facility, log cabin settlements, and snowy pines. | Sub-Zero Research Lab, Glacial Port, Alpine Resort | Radar Dome Ridge, Ski Lift Station, Glacier Ice Cliffs | Medium (Snowmobiles, Armored 4x4, Buggy with Snow Chains) | Blizzard (Dynamic visibility drop to 40m), Aurora Borealis Night, Crisp Dawn |
| **Crimson Dunes** | 4x4 km (16 km²) | Arid canyon wasteland, petroleum refinery rigs, ancient sandstone temple ruins, and train railyards. | Refinery Complex Alpha, Pharaoh's Sunken Tomb, Central Oasis Hub | Cleft Rock Plateau, Refinery Flare Tower, Sandstone Archway | High (Sand Buggies, Dirt Bikes, Armed Pickups) | Severe Sandstorm (Disrupts HUD radar, muffles sound), Scorching Day, Desert Twilight |
| **Neon Harbor** | 2x2 km (4 km²) | Cyberpunk nighttime container terminal, multi-tier cargo warehouses, skyscraper sky-bridges, and neon alleys. | Container Matrix Center, Drydock Super-Freighter, Neon Plaza | Crane Gantry Control Booth, Skybridge Overpass, Warehouse Roofs | Low (Electric Sports Cars, Urban Motorcycles) | Continuous Rainy Night with Neon Puddle Reflections and Atmospheric Mist |
| **Factory Zero** *(CS)* | 150x150 m | Industrial automated warehouse with conveyor belts, steel walkways, and shipping containers. | Center Mixing Vat | Overhead Catwalks, Forklift Ramps | None | Studio Halogen Lighting |
| **Skyline Rooftops** *(CS)*| 140x160 m | Dual penthouse helipads linked by glass bridges and AC exhaust units. | Central Glass Pavilion | Elevator Shaft Penthouses, Helipad Platforms | None | Sunset Golden Hour |
| **Old Bazaar** *(CS)* | 160x160 m | Narrow stone market alleys, cloth stalls, fountains, and second-story terrace windows. | Central Fountain Square | Residential Balconies, Minaret Terrace | None | Bright Mediterranean Daylight |
| **Reactor Core** *(CS)* | 130x170 m | High-tech fusion reactor chamber with pulsating energy barriers and coolant pipes. | Central Magnetic Core | Turbine Deck, Observation Deck | None | High-contrast Cyan and Alert Amber Glow |
| **Proving Grounds** | 1x1 km | Comprehensive sandbox with modular firing lanes, driving tracks, and mock city buildings. | Central Armory Plaza | Sniper Range Watchtowers | High (All vehicle prototypes available) | User-selectable weather and lighting |

---

## 3. WEAPONS ARSENAL & BALLISTICS SPECIFICATION

### Ballistics Engine Principles
* **Recoil Formula:** Each weapon has a procedural recoil curve: `VerticalRecoil = BaseKick * (1 + ContinuousFireTime * CurveFactor)` and `HorizontalDrift = PerlinNoise(Seed) * Variance`.
* **Bullet Physics:** Deterministic ballistic trajectory with muzzle velocity ($V_0$ in m/s), drag coefficient ($C_d$), and gravitational drop ($g = 9.81 \, \text{m/s}^2$).
* **Damage Falloff:** `EffectiveDamage = BaseDamage * Clamp((MaxRange - Distance)/(MaxRange - MinRange), MinMultiplier, 1.0)`.
* **Hit Multipliers:**
  * **Headshot:** 2.25x (Snipers/DMR: 2.5x to 3.0x).
  * **Upper Torso:** 1.0x.
  * **Lower Torso/Groin:** 0.85x.
  * **Limbs (Arms/Legs):** 0.70x.

### Complete Weapon Stats Table

| Class | Weapon Name | Base Dmg | Fire Rate (RPM) | Muzzle Vel (m/s) | Effective Range (m) | Mag Size (Ext) | Reload (s) | Attachments Slots | Recoil Profile |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AR** | **AR-7 Valkyrie** | 41 | 680 | 880 | 65 | 30 (40) | 2.1 | Muzzle, Grip, Mag, Optic, Stock | Moderate vertical, predictable right drift |
| **AR** | **AK-88 Titan** | 47 | 580 | 730 | 55 | 30 (40) | 2.5 | Muzzle, Mag, Optic | Heavy vertical kick, high first-shot punch |
| **AR** | **M4X Phantom** | 38 | 750 | 910 | 70 | 30 (42) | 1.9 | Muzzle, Grip, Mag, Optic, Stock | Extremely stable, low horizontal variance |
| **AR** | **SCAR-L Helios**| 40 | 640 | 850 | 60 | 30 (40) | 2.2 | Muzzle, Grip, Mag, Optic, Stock | User-friendly, smooth upward pull |
| **AR** | **G36 Viper** | 39 | 710 | 870 | 62 | 30 (40) | 2.0 | Muzzle, Grip, Mag, Optic | Integrated dual-optic support, balanced |
| **AR** | **Groza-M (Crate)**| 48 | 700 | 780 | 68 | 30 (45) | 2.4 | Muzzle (Supp only), Mag, Optic | Bullpup high-damage beast, high recoil |
| **SMG** | **MP-45 Vector** | 31 | 1050 | 380 | 28 | 25 (35) | 1.6 | Muzzle, Grip, Mag, Optic, Stock | Ultra-fast burst, sharp initial climb |
| **SMG** | **Cobra-9 (MP40)**| 33 | 900 | 410 | 32 | 30 (40) | 1.8 | Muzzle, Mag, Stock | Tight hipfire spread, mild vertical rise |
| **SMG** | **UMP-S Talon** | 37 | 660 | 430 | 38 | 30 (40) | 1.9 | Muzzle, Grip, Mag, Optic | Low recoil, high armor-shred efficiency |
| **SMG** | **P90 Apex** | 30 | 850 | 480 | 35 | 50 (50) | 2.6 | Optic, Muzzle | Built-in 50-round drum, horizontal spray |
| **SMG** | **Bizon Skorp** | 35 | 720 | 400 | 30 | 53 (53) | 2.7 | Muzzle, Optic | Helical mag, low recoil, consistent sweep |
| **SG** | **M1887 Thunder**| 120 (8x15)| 85 | 320 | 14 | 2 (2) | 1.4 (Shell)| Muzzle | Twin-barrel, devastating point-blank burst |
| **SG** | **SPAS-12 Breaker**| 104 (8x13)| 160 | 340 | 16 | 8 (10) | 0.5/shell| Muzzle, Optic, Stock | Pump-action, heavy recoil, tight choke |
| **SG** | **Origin-12 Auto**| 72 (8x9) | 320 | 310 | 12 | 10 (20) | 2.8 | Muzzle, Grip, Mag, Optic | Full-auto room clearer, high barrel climb |
| **SG** | **MAG-7 Tactical**| 88 (8x11) | 210 | 330 | 18 | 5 (7) | 1.9 | Muzzle, Optic | Box-fed tactical shotgun, fast reset |
| **SR** | **AWM Glacier (Crate)**| 135 | 32 | 960 | 180 | 5 (7) | 3.2 | Muzzle, Mag, Optic, Stock | 1-shot kill to Level 2 helmet, flat arc |
| **SR** | **M24 Stalker** | 88 | 42 | 890 | 140 | 5 (7) | 2.8 | Muzzle, Mag, Optic, Stock | High velocity, reliable bolt sniper |
| **SR** | **Kar98k Hunter** | 82 | 38 | 820 | 120 | 5 (5) | 3.4 (Clip)| Muzzle, Optic, Stock | Classic iron/scoped rifle with lethal headshot |
| **SR** | **Barrett .50 M82**| 145 | 24 | 920 | 200 | 5 (7) | 3.6 | Muzzle, Mag, Optic | Anti-materiel, pierces Gloo Walls & vehicles |
| **SR** | **Scout Elite** | 72 | 50 | 910 | 110 | 5 (10) | 2.2 | Muzzle, Mag, Optic, Stock | Lightweight mobile sniper with 0 movement penalty |
| **DMR** | **MK14 EBR (Crate)**| 65 | 450 | 850 | 95 | 10 (20) | 2.6 | Muzzle, Grip, Mag, Optic, Stock | Full-auto capable DMR, brutal close/long DPS |
| **DMR** | **SKS Sentinel** | 56 | 280 | 790 | 85 | 10 (20) | 2.4 | Muzzle, Grip, Mag, Optic, Stock | Semi-auto sniper with high tap-fire stability |
| **DMR** | **Mini-14 Precision**| 46 | 400 | 990 | 90 | 20 (30) | 2.1 | Muzzle, Mag, Optic | Ultra-fast bullet speed, negligible drop |
| **LMG** | **M249 SAW (Crate)**| 44 | 800 | 860 | 75 | 100 (150)| 5.4 | Optic | Sustained suppression, crouch bipod stability |
| **LMG** | **PKM Enforcer** | 51 | 600 | 760 | 70 | 100 (100)| 6.0 | Optic | Heavy caliber barrier shredder |
| **LMG** | **Negev Cyclone** | 39 | 950 | 820 | 65 | 150 (150)| 5.8 | Optic | Laser-like accuracy after first 10 rounds fired |
| **Pistol**| **Desert Eagle .50**| 58 | 240 | 450 | 35 | 7 (10) | 1.8 | Muzzle, Optic | Two-tap headshot sidearm, heavy kick |
| **Pistol**| **G18 Auto** | 24 | 1100 | 320 | 18 | 17 (25) | 1.5 | Muzzle, Mag, Optic | Pocket SMG for emergency close brawls |
| **Pistol**| **USP Tactical** | 36 | 360 | 360 | 28 | 12 (18) | 1.4 | Muzzle, Optic | Silent operator pistol with fast handling |
| **Pistol**| **Python .357** | 68 | 180 | 420 | 32 | 6 (6) | 2.5 | Optic | High-damage six-shooter |
| **Melee** | **Cast-Iron Pan** | 80 | 60 | N/A | 2 | N/A | N/A | None | Blocks bullets fired from behind when holstered |
| **Melee** | **Carbon Katana** | 90 | 80 | N/A | 2.5 | N/A | N/A | None | Extended range and fast sweeping arc |
| **Melee** | **Combat Machete** | 75 | 75 | N/A | 2 | N/A | N/A | None | High damage against vehicle tires |
| **Melee** | **Alloy Bat** | 65 | 90 | N/A | 2.2 | N/A | N/A | None | High stagger/knockback force |
| **Melee** | **Bare Knuckles** | 30 | 120 | N/A | 1.5 | N/A | N/A | None | Default melee |

### Tactical Throwables & Defensive Gear
* **Frag Grenade:** 180 Max Damage in 4m radius, 5s cook timer, bouncing physics.
* **Smoke Grenade:** 25s dense volumetric smoke screen, extinguishes thermite and blocks aim-assist and IR thermal detection.
* **Gloo Wall Shield Device:** Instantly projects an ice-hardened 3-segment barricade (1,000 HP, lasts 40s) for emergency cover against open-field crossfire.
* **Thermite Molotov:** 40 initial impact damage + 25 DPS fire pool for 8 seconds; blocks doorways and damages vehicles.
* **Stun Flashbang:** Blind and deafens targets for up to 4.5s depending on line-of-sight distance.
* **EMP Disruptor:** Disables vehicle engines, HUD minimap, and active character abilities for 6 seconds in an 8m blast radius.

### Protective Gear & Consumables
* **Helmets:** Level 1 (25% reduction, 80 durability) | Level 2 (40% reduction, 150 durability) | Level 3 (55% reduction, 220 durability, protects face).
* **Vests:** Level 1 (30% reduction, 120 durability) | Level 2 (45% reduction, 200 durability) | Level 3 (60% reduction, 280 durability, includes groin/neck plating) | Level 4 Nano-Vest (Air Drop: 65% reduction, auto-repairs 5 durability/sec out of combat).
* **Backpacks:** Level 1 (+150 Capacity) | Level 2 (+220 Capacity) | Level 3 (+300 Capacity).
* **Consumables:** Medkit (100% HP in 6s), Bandage (15 HP up to 75% in 2.5s), Energy Drink (+40 Boost over 30s), Adrenaline Shot (100% Boost & 10% move speed in 4s), Shield Repair Patch (+100 Armor durability in 4s).

---

## 4. CHARACTERS, ABILITIES & PET SYSTEMS

### Character Progression
* **Levels 1–6:** Ability efficiency increases by +5% per level, unlocked via Character Shards gained from matches and mastery crates.
* **Awakened State:** Complete 5 combat trials with the character to unlock an evolving cosmetic visual effect and a secondary enhancement trait.

### Roster of 20 Original Characters

| # | Character | Archetype | Active Ability | Passive Ability | Cooldown (Active) |
|---|---|---|---|---|---|
| 1 | **Vanguard (Tate)** | Pointman / Breacher | **Kinetic Barrier:** Deploys a forward energy dome that absorbs 350 incoming bullet damage for 6s. | **Iron Plating:** Reduces explosive and vehicle collision damage by 20%. | 45s |
| 2 | **Nyx** | Phantom Assassin | **Shadow Step:** Enters near-invisibility and silent footsteps for 5s; breaking stealth gives +15% fire rate for 2s. | **Dead Silence:** Eliminating an enemy silences gunfire sound for 4s. | 50s |
| 3 | **Dr. Linnea** | Combat Medic | **Bio-Regen Field:** Emits an 8m restorative aura healing 12 HP/s for self and squadmates for 7s. | **Triage:** Revive squadmates 30% faster; revived allies gain 35 bonus shield HP. | 40s |
| 4 | **Zephyr** | Aerial Scout | **Falcon Launch:** Launches a recon drone that pings all enemies in an 80m cone for 8s. | **Gale Tailwind:** Sprint speed is increased by 8% when holstered. | 55s |
| 5 | **Kurogane** | Cyber Samurai | **Iaido Strike:** Dashes forward 8m swinging an energy blade (deals 80 damage); grants 30% sprint boost for 4s. | **Bushido Resolve:** For every 15% missing HP, weapon reload speed increases by 10%. | 35s |
| 6 | **Valeria** | Arms Dealer | **Ammo Cache:** Drops a tactical crate supplying max ammo and +1 level attachment upgrades for squad. | **Deep Pockets:** Assault rifle ammo does not occupy inventory backpack capacity. | 60s |
| 7 | **Goliath (Boris)**| Heavy Gunner | **Overdrive Fortress:** Anchors feet, increasing LMG/AR fire rate by 20% and reducing recoil by 45% for 6s. | **Colossus Body:** Maximum HP pool permanently increased by +25 (225 Total HP). | 50s |
| 8 | **Aura** | Acoustic Sensor | **Sonar Pulse:** Sends out soundwaves up to 60m revealing enemy footstep directions through walls for 5s. | **Auditory Sharpness:** Directional audio indicators on minimap appear 25m earlier than normal. | 45s |
| 9 | **Ignis** | Pyro Specialist | **Thermite Geyser:** Slams the ground creating a 10m line of fire dealing 35 DPS and burning enemy armor. | **Flame Retardant:** Immune to own fire; takes 50% less fire damage from all sources. | 40s |
| 10| **Apex (Liam)** | Parkour Runner | **Adrenaline Surge:** Instantly cleanses slow effects and grants 25% sprint speed + high vault ability for 5s. | **Catlike Agility:** Reduces fall damage by 60% and landing recovery time to zero. | 30s |
| 11| **Cipher** | Cyber Infiltrator | **System Jammer:** Disables all enemy HUDs, minimaps, and scopes within 40m for 6s. | **Trace Back:** When taking enemy fire, the shooter's outline is highlighted for 2s. | 55s |
| 12| **Mirage** | Decoy Specialist | **Hologram Clone:** Spawns an identical AI decoy that runs forward firing blanks and drawing enemy auto-aim. | **Disappearing Act:** Spawns a smoke puff at current spot when armor is depleted (60s cooldown).| 40s |
| 13| **Riptide (Kai)** | Amphibious Ops | **Tidal Burst:** Projects a high-pressure water barrier that deflects throwables and extinguishes fire. | **Aquatic Mastery:** Swims 40% faster and takes 25% less damage while submerged in water. | 35s |
| 14| **Revenant (Dante)**| Death Dealer | **Soul Harvest:** For 10s, each knockdown instantly restores 60 HP and refills 50% magazine capacity. | **Bloodlust:** Movement speed increases by 10% when pursuing an enemy below 50 HP. | 65s |
| 15| **Sentry (Elena)** | Area Denial | **Micro-Turret:** Deploys an automated ceiling/ground turret targeting enemies within 20m (18 DPS). | **Reinforced Gloo:** Deployed Gloo Walls have +300 bonus durability HP. | 50s |
| 16| **Volt** | Electro Dynamo | **Shock Arc:** Discharges an EMP jolt that drains 50 shield points and slows targets by 30% for 3s. | **Static Charge:** Sprinting builds energy; first bullet fired after sprinting deals +15 electrical shock damage. | 45s |
| 17| **Bounty (Jax)** | Gunrunner | **Supply Beacon:** Summons a mini-drop containing high-tier attachments and level 3 vest. | **Headhunter:** Every headshot kill awards +150 bonus match currency / ranked score points. | 90s |
| 18| **Shade** | Sniper Specialist| **Target Lock:** Enters a focused sniper stance: removes weapon sway and highlights enemy head hitboxes for 6s. | **Deadly Range:** Bullet drop on all bolt-action rifles reduced by 40%. | 45s |
| 19| **Nova** | Gravity Controller| **Singularity Well:** Throws a gravitational core that pulls nearby enemies toward its center for 3s. | **Zero-G Hop:** Jump height increased by 25%; glide distance with wingsuit extended by 20%. | 60s |
| 20| **Bao** | Martial Hermit | **Chi Palm Blast:** Knocks back nearby enemies 6 meters and shatters enemy deployable Gloo Walls instantly. | **Inner Peace:** Medkits and consumables take 20% less time to apply. | 35s |

### Tactical Pet System
Pets accompany the operator in lobby and combat (visual models are clientside-streamed with zero hitbox to prevent gameplay obstruction). Each pet provides a specialized auxiliary passive:
1. **Cyber-Fox (Kitsune):** *Radar Scan* — Pings the nearest enemy within 45m when the Safe Zone begins shrinking.
2. **Red Panda (Bao-Bao):** *Herb Master* — Reduces consumable application cooldowns by 12%.
3. **Sky Falcon (Horus):** *Glider Assist* — Increases wingsuit descent glide speed by 15% and displays airdrop crate locations through fog.
4. **Robo-Hound (Titan-K9):** *Scavenger* — Automatically highlights Level 3 loot and armor within a 20m radius.
5. **Obsidian Panther (Kage):** *Prowler* — Crouch-walking speed is increased by 30% and crouch-footstep sound radius reduced to 3m.
6. **Glacial Penguin (Pingu):** *Cryo Core* — Generates 1 extra Gloo Wall every 120s if the player holds fewer than 2 walls.

---

## 5. VEHICLES & MOBILE COMBAT MECHANICS

### Vehicle Dynamics Engine
* **Driving Physics:** Raycast wheel suspension with drift handbrake, torque curves, terrain friction multipliers (Asphalt: 1.0, Grass: 0.8, Sand: 0.65, Snow: 0.55).
* **Fuel & Damage:** Standard gas tanks with combustible fuel cans. Vehicles taking damage below 15% HP catch fire (5-second countdown to explosive detonation dealing 250 fatal damage in 7m radius).
* **Tire Penetration:** Each tire has 80 HP. Shooting tires pops them, drastically reducing acceleration and causing severe steering pulling.
* **Drive-by Shooting:** Passengers in seats 2–4 can lean out with SMGs, Pistols, ARs, or Shotguns (spread increased by 25%). The driver can only discharge one-handed pistols.

| Vehicle | Capacity | Top Speed | Health | Terrain Specialty | Unique Combat Feature |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All-Terrain Buggy** | 2 | 105 km/h | 900 HP | Sand, hills, off-road | Exposed roll cage, ultra-responsive drift turning |
| **4x4 Tactical Jeep** | 4 | 90 km/h | 1,400 HP | All-weather, rocky roads | Fabric/steel roof options; high ramming damage |
| **Hyperion Sports Car**| 2 | 145 km/h | 800 HP | Asphalt roads | Fastest vehicle; low ground clearance, poor off-road |
| **Dirt Enduro Bike** | 2 | 115 km/h | 550 HP | Forest, steep mountain slopes | Can make massive vertical cliff jumps; high driver vulnerability |
| **Armored Rhino Truck**| 4 | 75 km/h | 2,200 HP | Urban blockades | Bullet-resistant glass (blocks first 250 damage), front cowcatcher |
| **Wave-Runner Jetski**| 2 | 95 km/h | 650 HP | Waterways, coast | Fast river scouting, high agility in water |
| **Speed Patrol Boat** | 4 | 80 km/h | 1,200 HP | Open sea, deep rivers | Mounted rear turret slot, heavy wave resistance |
| **Hover-Skiff (Glider)**| 1 | 85 km/h | 500 HP | Air / low-altitude hover | Deployed from mountain peaks; allows silent aerial infiltration |

---

## 6. GAMEPLAY SYSTEMS & MOBILE UX ARCHITECTURE

### Movement Mechanics
* **Sprinting:** Automatic sprint lock button, tactical sprint (burst for 4s with 12% speed increase, weapon down).
* **Crouch & Prone:** Fast responsive stance transitions; prone reduces recoil by 35% but eliminates mobility.
* **Combat Slide:** Pressing crouch while sprinting executes a 3m low-profile tactical slide.
* **Vaulting & Mantling:** Contextual climb over obstacles up to 2.2m high; ledge hang with weapon pull-out.
* **Lean / Peek:** Dedicated left/right lean toggles with "Auto-Open Scope on Peek" setting.

### HUD Customization & Control Schemes
* **Layout Presets:** 2-Finger Casual, 3-Finger Claw, 4-Finger Competitive, and 5-Finger Tablet configurations.
* **Customization Canvas:** Every button element features 10%–100% opacity, 50%–200% scale adjustment, and pixel-precise coordinate positioning.
* **Gyroscope Aiming:** Independent sensitivity sliders for No-Scope, Red Dot, 2x, 3x, 4x, 6x, and 8x; inversion options with low-latency hardware polling (200Hz).
* **Smart Aim & ADS Assist:** Tuned for mobile touchscreens: magnetic slowdown over target box without snapping (disabled in competitive esports rooms).

### Communication & Tactical Feedback
* **Contextual Smart Ping:** One-tap marker system: tap to ping location, double-tap for "Enemy Spotted", tap on loot to broadcast item name and tier, tap on vehicle for "Need Ride".
* **Positional 3D Footstep Engine:** Sound propagation calculates floor material (Metal, Wood, Water, Concrete, Snow) and elevation (muffled sounds if enemy is on the floor above/below).
* **Directional Sound Compass:** Mini-map and HUD compass flash stylized acoustic arcs for gunfire, footsteps, and vehicle motors with distance-based alpha gradients.

### Anti-Cheat & Security Framework
* **Hybrid Server Verification:** Fully authoritative server for character position, movement velocities (anti-speedhack), projectile spawn origin, fire rates, and line-of-sight hit checks.
* **Kernel & Memory Protection:** Integration of custom lightweight mobile anti-tamper runtime checking for APK memory modification, cheat overlay injectors, memory editors (e.g., GameGuardian), and root/jailbreak integrity.
* **Machine Learning Anomaly Detection:** Real-time heuristic tracking: aim snap angle velocity (degrees per millisecond), unnatural headshot clustering, and impossible wall-penetration vectors. Flags accounts for automated server-side review and instantaneous HWID bans.

---

## 7. PROGRESSION, RANKED SYSTEM & SEASONS

### Account Progression Architecture
* **Operator Account Level (1–100):** Unlocks game modes, custom room tickets, basic weapon skins, and gold currency.
* **Weapon Mastery Levels (1–50 per weapon):** Accumulate damage and kills with specific guns to unlock exclusive kill counters, gilded reticles, mastery banners, and custom weapon inspection animations.

### BR & CS Ranked System
* **Rank Tiers:** Bronze (I-III) -> Silver (I-III) -> Gold (I-IV) -> Platinum (I-IV) -> Diamond (I-IV) -> Heroic -> Master -> Grandmaster (Top 500 per Server) -> Champion (Top 100).
* **Tier Points (TP) Rating Formula:**
  $$\text{TP Gain} = (\text{Placement Score}) + (\text{Kills} \times \text{Kill Multiplier}) + (\text{Damage Dealt} \times 0.05) - (\text{Rank Tier Match Entry Cost})$$
* **Season Resets:** 60-day seasonal calendar with a soft reset (e.g., Diamond drops to Gold, Master drops to Platinum). Exclusive seasonal rewards include Animated Avatars, Gilded Weapon Bundles, and Master Parachutes.

---

## 8. COLLECTIONS, SKINS, EMOTES & COSMETICS

### Cosmetic Monetization Philosophy
**Strictly Visual & Auditory Enhancements — Zero Pay-to-Win Stat Boosts.** All bullet damages, movement speeds, and recoil values remain 100% identical across default weapons and legendary skins.

### Cosmetic Categories
1. **Themed Operator Bundles:** Full-body cosmetic transformations with custom lobby idle animations, unique voice line packs, and drop-in smoke trails.
   * *Themes:* Cyber Samurai, Zombie Bio-Hunter, Royal Dynasty Guard, Street Apex Racer, Space Marine Dreadnought, Kitsune Spirit Mystic.
2. **Upgradable Mythic Weapon Skins (Levels 1–7):**
   * *Level 1:* Base Skin Visuals.
   * *Level 2:* Custom Kill Announcement Broadcast Banner.
   * *Level 3:* Upgraded Glowing Visual Form & Reactive Laser Elements.
   * *Level 4:* Custom Particle Muzzle Flash & Tracer Fire.
   * *Level 5:* Custom Elimination Kill Effect (e.g., victim turns into a digital neon portal or frozen crystal).
   * *Level 6:* Exclusive Tactical Weapon Inspection Animation.
   * *Level 7:* Custom Exclusive Kill Loot Crate Model.
3. **Emote System:** 40+ launch emotes categorized into:
   * *Battlefield Taunts & Salutes* (e.g., "Respect The Pan", "Crown Flex", "Breakdance Sweep").
   * *Squad Synced Group Emotes:* When triggered, nearby squadmates receive a prompt to join the synchronized dance or formation.
   * *Victory Ceremonies:* Custom animations playing on the 1st Place Victory Royale podium.

---

## 9. LOBBY, SOCIAL & IN-GAME ECONOMY

### Lobby & Social Systems
* **Interactive 3D Runway Hangar:** Real-time 3D hangar showcase featuring the player's equipped operator, animated pet, equipped primary weapon, and squad members standing together with 360° mouse/touch rotation.
* **Fast Squad Join (Team Code):** 6-character alphanumeric code allowing players to jump straight into friends' lobbies across global servers without manual friend requests.
* **Guild & Clan System:** Up to 50 players per guild, Clan XP progression, weekly Clan Wars tournaments on Saturdays with guild leaderboard rankings and shared guild token stores.

### Dual Currency Model
* **Gold Coins (Earned Free via Gameplay):** Rewarded for completing matches, daily missions, leveling up, and season placement. Used to unlock base characters, character ability upgrades, level-up fragments, and standard supply crates.
* **Diamonds (Premium Hard Currency):** Purchased via app store microtransactions. Used for Elite Passes, Mythic Weapon Spins, character bundles, and premium cosmetics.

---

## 10. ART DIRECTION, AUDIO & UI/UX

### Visual Aesthetics
* **Art Style:** Semi-realistic military aesthetic infused with high-tech cyberpunk vibrancy. Clean character silhouettes designed for immediate visual recognition at distances up to 250 meters.
* **Mobile Shading Pipeline:** Forward+ rendering utilizing Unity URP / Unreal Mobile Renderer with Half-Precision FP16 shaders, clustered light culling, and bake-baked spherical harmonic ambient lighting for high-end fidelity at minimal battery draw.

### Audio Pipeline
* **Spatial 3D Audio:** Dynamic HRTF (Head-Related Transfer Function) spatial audio mixing powered by FMOD or Wwise.
* **Gun Acoustics:** Multi-layer sampling recording the mechanical bolt action, high-frequency supersonic bullet crack, and reverberant environmental tail (differentiating indoor concrete rooms, open plains, and metal shipping containers).

---

## 11. TECHNICAL ARCHITECTURE & NETCODE SPECIFICATION

### Network Architecture
* **Authoritative Client-Server:** 30 Hz Dedicated Game Server tick-rate built on C++ / Go running containerized inside Kubernetes clusters (AWS GameLift / Agones on Google Cloud Platform).
* **Lag Compensation:** Client-side prediction with server-side rewind buffer (interpolating player positions up to 250ms in the past to validate hit registration with high fairness).
* **Network Protocol:** Low-latency reliable/unreliable UDP transport powered by ENet or KCP with zero-overhead packet serialization.

### Mobile Performance & Scalability Tiers

| Hardware Tier | Target Devices | Render Resolution | Target FPS | Shadow Quality | Draw Distance | Texture LOD |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Low Tier** | Snapdragon 680, Helio G88, 3GB RAM | 720p (0.75x Scale) | 45–60 FPS | Disabled (Blob shadow) | 250m | Low (Compressed ASTC 6x6) |
| **Mid Tier** | Snapdragon 778G, Dimensity 1200, 6GB RAM | 1080p (Native) | 60 FPS | Dynamic Directional (Low res) | 400m | Medium (ASTC 5x5) |
| **High Tier** | Snapdragon 8 Gen 2/3, Apple A16/A17, 8GB+ | 1080p / 1440p | 90–120 FPS | Cascaded Soft Shadows (PCF) | 650m | High (Uncompressed Mipmaps) |

---

## 12. 12-MONTH PRODUCTION ROADMAP

| Phase | Duration | Core Deliverables & Milestones | Team Focus |
|---|---|---|---|
| **Phase 1: Pre-Production & Core Prototype** | Months 1–2 | • Camera, locomotion (sprint, slide, vault, lean)<br>• Procedural recoil & deterministic ballistic engine<br>• Dedicated 30Hz server prototype with client prediction & rollback | 12 Senior Leads (Tech, Design, Art) |
| **Phase 2: Alpha Foundation** | Months 3–5 | • First 8x8 km map blockout (*Solaris Isle*)<br>• First 10 Characters with active/passive abilities<br>• Core weapon arsenal (15 weapons)<br>• Clash Squad (4v4) game mode & shop economy<br>• 50-player internal stress playtests | 28 Staff |
| **Phase 3: Content Expansion & Closed Beta** | Months 6–8 | • Maps *Frostline* (4x4) & *Crimson Dunes* (4x4)<br>• Full 20 Character roster + 6 Tactical Pets<br>• All 34 weapons, vehicles & physics integration<br>• Ranked MMR system, seasonal Elite Pass<br>• Closed Beta test (10,000 players via Google Play Console & TestFlight) | 40 Staff |
| **Phase 4: Optimization & Soft Launch** | Months 9–10 | • Low-end device profiling (Snapdragon 680 target 60 FPS)<br>• Dynamic LOD streaming & On-Demand Map downloads<br>• Complete anti-cheat integration & payment gateway setup<br>• Soft Launch in SEA & LATAM regions (500,000 active players) | 45 Staff |
| **Phase 5: Global Launch & LiveOps** | Months 11–12 | • Global marketing rollout & Season 1 launch<br>• Esports tournament spectator client & custom rooms<br>• LiveOps bi-weekly event and balance patch cadence | 45 Staff + LiveOps Support |

### Studio Staffing Plan (45 Full-Time Employees)
* **Engineering (14):** 3 Gameplay, 4 Netcode/Server, 3 Mobile Graphics/Optimization, 2 Backend Infrastructure, 2 Anti-Cheat/Tools.
* **Game Design (6):** 1 Lead Designer, 2 Systems & Economy, 2 Level Designers, 1 Combat Balance Tuner.
* **Art & Animation (16):** 4 3D Characters, 4 3D Environments, 3 3D Weapons/Vehicles, 3 Animators/Riggers, 2 UI/UX Artists.
* **Audio (2):** 1 Sound Designer, 1 Audio Implementer (Wwise/FMOD).
* **QA & LiveOps (7):** 1 QA Lead, 4 Embedded Testers, 2 Community & LiveOps Specialists.
