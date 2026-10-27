import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { PlayerStats, UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local storage session key for guest / dev mode
const GUEST_STORAGE_KEY = 'arena_strike_guest_session';

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single();

        return {
          id: session.user.id,
          email: session.user.email,
          username: profile?.username || session.user.user_metadata?.username || splitEmail(session.user.email),
          avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
          isGuest: false,
        };
      }
    } catch (err) {
      console.warn('[AUTH] Session restoration error:', err);
    }
  }

  // Check guest session
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  }

  return null;
}

export async function getAuthToken(): Promise<string | undefined> {
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  }
  const user = await getCurrentUser();
  if (user) {
    return `dev_token_:${user.id}:${encodeURIComponent(user.username)}`;
  }
  return undefined;
}

export async function signUpWithEmail(email: string, password: string, username: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or use Guest Pilot Play.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please use Quick Play or configure Supabase credentials.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export function signInAsGuest(customUsername?: string): UserProfile {
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const guestUser: UserProfile = {
    id: 'guest_' + Math.random().toString(36).substring(2, 10),
    username: customUsername?.trim() || `Pilot_${randomSuffix}`,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSuffix}`,
    isGuest: true,
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export async function signOutUser() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

export async function fetchPlayerStats(userId: string): Promise<PlayerStats> {
  const defaultStats: PlayerStats = {
    matches_played: 0,
    matches_won: 0,
    total_kills: 0,
    total_deaths: 0,
    win_rate_pct: 0,
    kd_ratio: 0,
  };

  if (!supabase) {
    // Return sample or cached stats for guest
    return defaultStats;
  }

  try {
    const { data, error } = await supabase
      .from('player_statistics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return defaultStats;

    const winRate = data.matches_played > 0 ? (data.matches_won / data.matches_played) * 100 : 0;
    const kd = data.total_deaths > 0 ? data.total_kills / data.total_deaths : data.total_kills;

    return {
      matches_played: data.matches_played,
      matches_won: data.matches_won,
      total_kills: data.total_kills,
      total_deaths: data.total_deaths,
      win_rate_pct: Math.round(winRate * 10) / 10,
      kd_ratio: Math.round(kd * 100) / 100,
    };
  } catch (err) {
    console.warn('[STATS] Could not fetch stats from Supabase:', err);
    return defaultStats;
  }
}

export async function fetchLeaderboard(): Promise<any[]> {
  try {
    const serverUrl = import.meta.env.VITE_SERVER_URL || (typeof window !== 'undefined' && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000');
    const res = await fetch(`${serverUrl}/api/leaderboard?limit=25`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('[LEADERBOARD] Fetch failed, returning empty:', err);
  }
  return [];
}

function splitEmail(email?: string): string {
  if (!email) return 'Pilot';
  return email.split('@')[0];
}
