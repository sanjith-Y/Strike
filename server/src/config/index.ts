import dotenv from 'dotenv';
import path from 'path';

// Load .env from server dir or root dir
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',').map(s => s.trim()),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET || '',
  serverTickRate: parseInt(process.env.SERVER_TICK_RATE || '30', 10),
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate critical variables in production
if (config.isProduction && (!config.supabaseUrl || !config.supabaseServiceRoleKey)) {
  console.warn('[CONFIG WARNING] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in production mode. Database persistence will run in memory fallback mode.');
}
