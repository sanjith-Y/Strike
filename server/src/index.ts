import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { RoomManager } from './rooms/RoomManager.js';
import { NetworkHandler } from './networking/socketHandler.js';
import { getGlobalLeaderboard } from './auth/supabase.js';

const app = express();
const server = http.createServer(app);

// 1. Security & Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // Allow 3D canvas and WebGL resources
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or dev tools)
    if (!origin) return callback(null, true);
    if (config.corsOrigin.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev
  },
  credentials: true,
}));

app.use(express.json());

// 2. Setup Realtime Rooms & Sockets
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const roomManager = new RoomManager();
const networkHandler = new NetworkHandler(io, roomManager);
networkHandler.registerEvents();

// 3. REST API Routes
const healthHandler = (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    game: 'ARENA STRIKE Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string || '20', 10);
    const leaderboard = await getGlobalLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  res.json({
    success: true,
    data: {
      id: room.id,
      code: room.code,
      status: room.status,
      playerCount: room.players.length,
      maxPlayers: room.settings.maxPlayers,
    },
  });
});

// 4. Start Server
server.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  ARENA STRIKE — MULTIPLAYER AUTHORITATIVE SERVER   `);
  console.log(`  Running on port: ${config.port}                     `);
  console.log(`  Environment: ${config.nodeEnv}                     `);
  console.log(`====================================================`);
});

export { app, server, roomManager };
