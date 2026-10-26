-- ============================================================
-- ARENA STRIKE: DATABASE SCHEMA & MIGRATIONS
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(32) NOT NULL UNIQUE,
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on username for quick search and uniqueness validation
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ------------------------------------------------------------
-- 2. PLAYER_STATISTICS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_statistics (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    matches_played INTEGER NOT NULL DEFAULT 0 CHECK (matches_played >= 0),
    matches_won INTEGER NOT NULL DEFAULT 0 CHECK (matches_won >= 0),
    total_kills INTEGER NOT NULL DEFAULT 0 CHECK (total_kills >= 0),
    total_deaths INTEGER NOT NULL DEFAULT 0 CHECK (total_deaths >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for leaderboard queries: descending wins, kills, K/D
CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON public.player_statistics(matches_won DESC, total_kills DESC);

-- ------------------------------------------------------------
-- 3. MATCHES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id VARCHAR(32) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMPTZ,
    winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    match_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (match_status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_matches_room_id ON public.matches(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner ON public.matches(winner_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);

-- ------------------------------------------------------------
-- 4. MATCH_PLAYERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.match_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
    deaths INTEGER NOT NULL DEFAULT 0 CHECK (deaths >= 0),
    final_score INTEGER NOT NULL DEFAULT 0 CHECK (final_score >= 0),
    placement INTEGER NOT NULL DEFAULT 1 CHECK (placement >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user_id ON public.match_players(user_id);

-- ------------------------------------------------------------
-- 5. AUTOMATIC PROFILE & STATS CREATION TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_username TEXT;
BEGIN
    -- Extract username from metadata or fallback to email prefix
    initial_username := COALESCE(
        new.raw_user_meta_data->>'username',
        split_part(new.email, '@', 1)
    );
    
    -- Ensure username doesn't exceed 30 chars and replace special characters
    initial_username := regexp_replace(initial_username, '[^a-zA-Z0-9_]', '', 'g');
    IF length(initial_username) < 3 THEN
        initial_username := 'Pilot_' || substr(new.id::text, 1, 6);
    END IF;

    -- Avoid conflicts by appending random suffix if needed
    BEGIN
        INSERT INTO public.profiles (id, username, avatar_url)
        VALUES (new.id, initial_username, COALESCE(new.raw_user_meta_data->>'avatar_url', ''));
    EXCEPTION WHEN unique_violation THEN
        INSERT INTO public.profiles (id, username, avatar_url)
        VALUES (new.id, initial_username || '_' || substr(new.id::text, 1, 4), COALESCE(new.raw_user_meta_data->>'avatar_url', ''));
    END;

    -- Initialize player statistics
    INSERT INTO public.player_statistics (user_id, matches_played, matches_won, total_kills, total_deaths)
    VALUES (new.id, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hook on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES:
-- Anyone authenticated can view public profiles
CREATE POLICY "Allow public read access to profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can only update their own profile (e.g. username, avatar)
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- PLAYER_STATISTICS POLICIES:
-- Anyone can view player statistics (needed for leaderboard and profile viewing)
CREATE POLICY "Allow public read access to player_statistics"
    ON public.player_statistics FOR SELECT
    USING (true);

-- Only service_role can update player statistics (prevents client-side spoofing)
CREATE POLICY "Service role only update on player_statistics"
    ON public.player_statistics FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- MATCHES POLICIES:
-- Anyone authenticated can read match records
CREATE POLICY "Allow public read access to matches"
    ON public.matches FOR SELECT
    USING (true);

-- Only service_role can insert or update matches
CREATE POLICY "Service role only manage matches"
    ON public.matches FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- MATCH_PLAYERS POLICIES:
-- Anyone authenticated can read match results
CREATE POLICY "Allow public read access to match_players"
    ON public.match_players FOR SELECT
    USING (true);

-- Only service_role can insert or update match_players
CREATE POLICY "Service role only manage match_players"
    ON public.match_players FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------
-- 7. LEADERBOARD VIEW WITH WIN RATE AND K/D
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
    p.id AS user_id,
    p.username,
    p.avatar_url,
    s.matches_played,
    s.matches_won,
    s.total_kills,
    s.total_deaths,
    CASE 
        WHEN s.matches_played > 0 THEN ROUND((s.matches_won::numeric / s.matches_played::numeric) * 100, 1)
        ELSE 0 
    END AS win_rate_pct,
    CASE 
        WHEN s.total_deaths > 0 THEN ROUND((s.total_kills::numeric / s.total_deaths::numeric), 2)
        ELSE s.total_kills::numeric
    END AS kd_ratio
FROM public.profiles p
JOIN public.player_statistics s ON p.id = s.user_id
ORDER BY s.matches_won DESC, s.total_kills DESC;
