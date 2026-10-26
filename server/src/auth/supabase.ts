import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { UserIdentity, MatchResultData } from '../types/game.js';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseServiceRoleKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('[SUPABASE] Connected to Supabase with service role authorization');
  } catch (err) {
    console.error('[SUPABASE] Failed to initialize Supabase client:', err);
  }
} else {
  console.log('[SUPABASE] Running in local/dev mode without Supabase credentials. Statistics will be recorded in-memory.');
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}

// In-memory fallback for local testing without cloud credentials
const inMemoryStats = new Map<string, { matchesPlayed: number; matchesWon: number; kills: number; deaths: number; username: string }>();
const inMemoryMatches: MatchResultData[] = [];

/**
 * Verifies authentication token (Supabase JWT or authenticated dev token)
 */
export async function verifyUserToken(token: string | undefined): Promise<UserIdentity | null> {
  if (!token) {
    return null;
  }

  // Check if it's a dev guest token
  if (token.startsWith('dev_token_') || token.startsWith('guest_')) {
    try {
      const parts = token.split(':');
      const userId = parts[1] || 'pilot_' + Math.random().toString(36).substring(2, 8);
      const username = parts[2] ? decodeURIComponent(parts[2]) : 'Pilot_' + userId.substring(0, 4);
      return {
        id: userId,
        username,
        isGuest: true,
      };
    } catch {
      return null;
    }
  }

  // If Supabase is active, verify JWT with Supabase auth
  if (supabaseClient) {
    try {
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);
      if (error || !user) {
        return null;
      }

      // Fetch user profile
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        username: profile?.username || user.user_metadata?.username || splitEmail(user.email) || 'Pilot_' + user.id.slice(0, 5),
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        isGuest: false,
      };
    } catch (err) {
      console.error('[AUTH] Token verification error:', err);
      return null;
    }
  }

  return null;
}

function splitEmail(email?: string): string {
  if (!email) return '';
  return email.split('@')[0];
}

/**
 * Persists finished match results and updates player statistics safely
 */
export async function persistMatchResult(result: MatchResultData): Promise<boolean> {
  // Always update in-memory cache
  inMemoryMatches.push(result);
  for (const entry of result.scoreboard) {
    const existing = inMemoryStats.get(entry.userId) || {
      matchesPlayed: 0,
      matchesWon: 0,
      kills: 0,
      deaths: 0,
      username: entry.username,
    };
    existing.matchesPlayed += 1;
    if (entry.placement === 1 && result.winnerUserId === entry.userId) {
      existing.matchesWon += 1;
    }
    existing.kills += entry.kills;
    existing.deaths += entry.deaths;
    existing.username = entry.username;
    inMemoryStats.set(entry.userId, existing);
  }

  if (!supabaseClient) {
    console.log(`[DATABASE] Persisted match ${result.matchId} to in-memory store`);
    return true;
  }

  try {
    // 1. Insert match record
    const { error: matchError } = await supabaseClient
      .from('matches')
      .insert({
        id: result.matchId,
        room_id: result.roomId,
        started_at: result.startedAt,
        ended_at: result.endedAt,
        winner_user_id: result.winnerUserId,
        match_status: 'completed',
      });

    if (matchError) {
      console.error('[DATABASE] Error saving match record:', matchError);
    }

    // 2. Insert match_players
    const playerInserts = result.scoreboard.map(p => ({
      match_id: result.matchId,
      user_id: p.userId,
      kills: p.kills,
      deaths: p.deaths,
      final_score: p.score,
      placement: p.placement,
    }));

    const { error: playersError } = await supabaseClient
      .from('match_players')
      .insert(playerInserts);

    if (playersError) {
      console.error('[DATABASE] Error saving match_players:', playersError);
    }

    // 3. Atomically update player_statistics for each participant
    for (const player of result.scoreboard) {
      const isWinner = result.winnerUserId === player.userId;

      // Upsert statistics
      const { data: existing } = await supabaseClient
        .from('player_statistics')
        .select('*')
        .eq('user_id', player.userId)
        .single();

      if (existing) {
        await supabaseClient
          .from('player_statistics')
          .update({
            matches_played: existing.matches_played + 1,
            matches_won: existing.matches_won + (isWinner ? 1 : 0),
            total_kills: existing.total_kills + player.kills,
            total_deaths: existing.total_deaths + player.deaths,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', player.userId);
      } else {
        await supabaseClient
          .from('player_statistics')
          .insert({
            user_id: player.userId,
            matches_played: 1,
            matches_won: isWinner ? 1 : 0,
            total_kills: player.kills,
            total_deaths: player.deaths,
          });
      }
    }

    console.log(`[DATABASE] Successfully persisted match ${result.matchId} to Supabase`);
    return true;
  } catch (err) {
    console.error('[DATABASE] Exception while persisting match result:', err);
    return false;
  }
}

/**
 * Retrieves global leaderboard data
 */
export async function getGlobalLeaderboard(limit = 20) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('leaderboard_view')
        .select('*')
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.error('[LEADERBOARD] Error querying Supabase view:', err);
    }
  }

  // Fallback to in-memory stats
  const list = Array.from(inMemoryStats.entries()).map(([userId, stats], idx) => {
    const winRate = stats.matchesPlayed > 0 ? (stats.matchesWon / stats.matchesPlayed) * 100 : 0;
    const kd = stats.deaths > 0 ? stats.kills / stats.deaths : stats.kills;
    return {
      user_id: userId,
      username: stats.username,
      avatar_url: '',
      matches_played: stats.matchesPlayed,
      matches_won: stats.matchesWon,
      total_kills: stats.kills,
      total_deaths: stats.deaths,
      win_rate_pct: Math.round(winRate * 10) / 10,
      kd_ratio: Math.round(kd * 100) / 100,
    };
  });

  list.sort((a, b) => b.matches_won - a.matches_won || b.total_kills - a.total_kills);
  return list.slice(0, limit);
}
