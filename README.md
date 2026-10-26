# ARENA STRIKE — 3D Online Multiplayer Third-Person Shooter

**ARENA STRIKE** is a high-octane, browser-based 3D multiplayer deathmatch shooting game engineered with **Three.js**, **React**, **TypeScript**, **Node.js**, **Socket.IO**, and **Supabase**.

Players can register, log in, create private multiplayer rooms, invite friends using unique 6-character room codes or 1-click shareable URLs, customize match rules, and compete in real-time tactical third-person combat.

---

## 🎯 Architecture & Key Features

- **3D Tactical Arena**:
  - Sci-fi cyberpunk arena built in Three.js with soft shadow maps, ambient energy glow, and directional lighting.
  - Symmetrical cover bunkers, monuments, crates, and elevated platforms.
  - Third-person over-the-shoulder camera with mouse look, pitch clamping (-70° to +70°), smooth target interpolation, and wall collision avoidance.
  - Polished procedural 3D sci-fi cyborg player meshes with illuminated neon visors, animated running legs, and weapon models.
  - Mobile touch controls featuring an on-screen virtual joystick, drag-to-aim surface, and dedicated fire/reload/jump buttons.

- **Authoritative Multiplayer Networking**:
  - Fixed **30Hz server tick simulation loop** via Socket.IO.
  - Server-authoritative raycast hit validation against 3D player bounding cylinders.
  - Anti-cheat position and speed clamping (rejects illegal teleportation and speed exploits).
  - Client-side prediction with remote-player position and rotation interpolation.
  - Muzzle flashes, colored bullet tracers, and visual damage direction indicators.

- **Authoritative Weapon System**:
  - **AR-7 Valkyrie** starter assault rifle:
    - 25 HP damage per shot (4 shots to eliminate a 100 HP target).
    - Authoritative fire rate cooldown (125ms / ~8 rounds/sec).
    - Magazine capacity: 30 rounds.
    - Reserve ammunition: 120 rounds.
    - Authoritative 2.0s reload timer and ammo replenishment.

- **Health, Elimination, and Respawn**:
  - 100 Max Health with real-time HUD vitals and red low-health pulse.
  - 3-second respawn timer upon elimination.
  - Dynamic respawn point selection: algorithm selects the spawn point furthest from all active opponents to prevent spawn-camping.

- **Private Rooms & Matchmaking**:
  - Secure 6-character alphanumeric room code generator (excludes ambiguous chars like `0`, `O`, `1`, `I`).
  - 1-Click shareable invitation URLs (`?room=CODE`).
  - Squad lobby supporting up to 8 players, ready toggles, and squad leader transfer on host disconnect.
  - Configurable match duration (3, 5, 10 min), kill targets (10, 20, 30 kills), and respawn delays.

- **Database & Authentication**:
  - **Supabase Auth** for email/password registration, login, and secure sessions.
  - **Guest / Dev Quick Play** mode allowing immediate instant multiplayer testing across tabs or devices without requiring live Supabase credentials.
  - **Supabase PostgreSQL** schema with Row Level Security (RLS) policies protecting `profiles`, `player_statistics`, `matches`, and `match_players`.
  - Database-backed global leaderboard calculating win rate (%) and kill/death (K/D) ratios.

- **Procedural Web Audio Engine**:
  - Zero-dependency sound synthesizer using standard Web Audio API (`AudioContext`).
  - Punchy procedural gunshots (filtered noise bursts + sub-bass punch), hit markers, elimination fanfare, reload latch clicks, jump whooshes, and match start gongs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite 6, Three.js 0.174, Tailwind CSS 3, Lucide React |
| **Backend** | Node.js (ESM), TypeScript, Express 4, Socket.IO 4, Helmet, CORS |
| **Database & Auth** | Supabase Auth, PostgreSQL 15, Row Level Security (RLS) |
| **Audio** | HTML5 Web Audio API (Procedural Synthesizer) |
| **Testing** | Vitest 3 |

---

## 📂 Project Structure

```
arena-strike/
├── client/
│   ├── src/
│   │   ├── components/       # Navbar, Modals
│   │   ├── game/             # ArenaWorld, PlayerMesh, ThirdPersonCamera, TouchControls, GameHUD, GameCanvas
│   │   ├── pages/            # LandingPage, AuthPage, DashboardPage, LobbyPage, ProfilePage, SettingsPage, LeaderboardPage
│   │   ├── services/         # Supabase client, SocketService, Web Audio synthesizer
│   │   ├── types/            # TypeScript interfaces and protocol definitions
│   │   ├── App.tsx           # Main application coordinator and router
│   │   └── main.tsx          # Client entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── auth/             # Supabase verification, token verification, persistence
│   │   ├── config/           # Environment configuration
│   │   ├── database/         # Database helpers
│   │   ├── gameplay/         # Authoritative MatchEngine, WeaponSystem, Vitest unit tests
│   │   ├── networking/       # Socket.IO connection and packet handlers
│   │   ├── rooms/            # RoomManager (room codes, squad management)
│   │   ├── types/            # Shared server types
│   │   └── index.ts          # Express + Socket.IO server entry point
│   ├── tsconfig.json
│   └── package.json
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Complete schema, RLS policies, indexes, and triggers
├── .env.example              # Environment variables template
├── .gitignore
├── package.json              # Root npm workspaces monorepo configuration
└── README.md
```

---

## 🚀 Quickstart & Local Development

### Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended).
- **npm**: v9.0.0 or later.

### 1. Installation

From the project root:

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

```env
# Frontend (Client)
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_SERVER_URL=http://localhost:4000

# Backend (Server)
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
SERVER_TICK_RATE=30
```

> **Note**: Arena Strike includes an **instant dev & guest fallback mode**. If live Supabase credentials are not provided, all matchmaking, room creation, 3D combat, and in-memory statistics function immediately out of the box!

### 3. Run Development Servers

Run both backend and frontend concurrently:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:4000)
npm run dev:server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run dev:client
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

Execute the automated test suite covering room code generation, squad capacity, weapon fire rate cooldowns, reload timing, and 3D raycast hit detection:

```bash
npm test
```

Build verification across both workspaces:

```bash
npm run build
```

---

## 🎮 How to Test Multiplayer Locally

1. Open `http://localhost:5173` in Window A.
2. Click **Play Now** (or Sign Up / Quick Play).
3. Click **Create Room** on the Dashboard.
4. Copy the 6-character room code (e.g. `K9W4MZ`) or click **Share Invite Link**.
5. Open an Incognito Window (or second browser) in Window B and navigate to `http://localhost:5173`.
6. Click **Play Now** -> **Join Room** and enter the code (or paste the invitation link).
7. In Window B, toggle **Set as Ready**.
8. In Window A, click **Deploy Arena Strike**.
9. Both windows will load into the 3D arena. Move with **W, A, S, D**, look and aim with the **Mouse**, and shoot each other in real time with **Left Click**!

---

## 🗄️ Supabase Setup & Database Migrations

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/migrations/001_initial_schema.sql`](file:///Users/sanjith/Game/supabase/migrations/001_initial_schema.sql), paste its contents, and click **Run**.
4. The script will create:
   - `profiles` table with automatic triggers on user registration.
   - `player_statistics` table with RLS restricting updates to `service_role`.
   - `matches` and `match_players` tables for match history and scoreboards.
   - `leaderboard_view` for ranking calculation.
5. In your Supabase Project Settings -> **API**, copy:
   - **Project URL** -> `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon / public key** -> `VITE_SUPABASE_ANON_KEY`
   - **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY` (Keep secure on the server!)

---

## 🚢 Production Deployment

### Frontend (e.g. Vercel, Netlify, Cloudflare Pages)

1. Connect your repository to your hosting provider.
2. Set Root Directory to `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SERVER_URL` (Points to your deployed backend URL, e.g. `https://api.yourdomain.com`).

### Backend (e.g. Render, Railway, Fly.io, AWS EC2)

1. Deploy the `server` directory as a persistent Node.js web service (requires persistent WebSocket support).
2. Start command: `node dist/index.js` (after `npm run build`).
3. Set Environment Variables:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-domain.com`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
