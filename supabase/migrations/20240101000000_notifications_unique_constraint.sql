-- Add episode_id column (text) if it does not already exist
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS episode_id TEXT;

-- Add unique constraint required by the upsert onConflict clause in
-- checkNewEpisodes.utils.js.  Without this index Supabase/PostgREST returns
-- a 400 Bad Request when the client calls .upsert(..., { onConflict: ... }).
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_unique_per_user_anime_episode;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_unique_per_user_anime_episode
  UNIQUE (user_id, anime_id, episode_num, notification_type);
