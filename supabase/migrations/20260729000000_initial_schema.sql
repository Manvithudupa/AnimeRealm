-- AnimeRealm - Supabase Migration
-- Run this in your Supabase SQL editor to set up the required tables.
-- Timestamp: 2026-07-29

-- ===========================
-- 1. Watchlists Table
-- ===========================
CREATE TABLE IF NOT EXISTS public.watchlists (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id TEXT NOT NULL,
    anime_title TEXT,
    anime_poster TEXT,
    status TEXT NOT NULL DEFAULT 'watching' CHECK (status IN ('watching', 'plan_to_watch', 'completed', 'on_hold', 'dropped')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_status ON public.watchlists(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_watchlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_watchlists_updated_at ON public.watchlists;
CREATE TRIGGER trigger_watchlists_updated_at
    BEFORE UPDATE ON public.watchlists
    FOR EACH ROW
    EXECUTE FUNCTION update_watchlists_updated_at();

-- ===========================
-- 2. Continue Watching Table
-- ===========================
CREATE TABLE IF NOT EXISTS public.continue_watching (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id TEXT NOT NULL,
    title TEXT,
    japanese_title TEXT,
    poster TEXT,
    episode_id TEXT,
    episode_num INTEGER,
    left_at DOUBLE PRECISION,
    duration DOUBLE PRECISION,
    adult_content BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);

CREATE INDEX IF NOT EXISTS idx_continue_watching_user_id ON public.continue_watching(user_id);
CREATE INDEX IF NOT EXISTS idx_continue_watching_updated_at ON public.continue_watching(updated_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_continue_watching_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_continue_watching_updated_at ON public.continue_watching;
CREATE TRIGGER trigger_continue_watching_updated_at
    BEFORE UPDATE ON public.continue_watching
    FOR EACH ROW
    EXECUTE FUNCTION update_continue_watching_updated_at();

-- ===========================
-- 3. Profiles Table
-- ===========================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    gender TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- ===========================
-- 4. Notifications Table
-- ===========================
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    anime_id TEXT NOT NULL,
    anime_title TEXT,
    anime_poster TEXT,
    episode_num INTEGER,
    episode_id TEXT,
    notification_type TEXT NOT NULL DEFAULT 'continue_watching' CHECK (notification_type IN ('continue_watching', 'watchlist')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Prevent duplicate notifications for the same anime/episode
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique
    ON public.notifications(user_id, anime_id, episode_num, notification_type);

-- ===========================
-- 5. Row Level Security (RLS)
-- ===========================
-- Enable RLS on all tables
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continue_watching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Watchlists: users can only see and manage their own entries
CREATE POLICY "Users can view their own watchlist"
    ON public.watchlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist"
    ON public.watchlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist"
    ON public.watchlists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist"
    ON public.watchlists FOR DELETE
    USING (auth.uid() = user_id);

-- Continue Watching: users can only see and manage their own entries
CREATE POLICY "Users can view their own continue watching"
    ON public.continue_watching FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own continue watching"
    ON public.continue_watching FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own continue watching"
    ON public.continue_watching FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own continue watching"
    ON public.continue_watching FOR DELETE
    USING (auth.uid() = user_id);

-- Profiles: users can only see and manage their own
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
    ON public.profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Notifications: users can only see and manage their own
CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ===========================
-- 6. Helper Functions
-- ===========================
-- Delete current user account (called from Profile page)
CREATE OR REPLACE FUNCTION public.delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
