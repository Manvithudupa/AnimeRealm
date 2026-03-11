-- Ensure episode_id column (text) exists.
-- If it was already added to the table this is a no-op.
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS episode_id TEXT;

-- Add the composite unique constraint required by the upsert onConflict clause
-- in checkNewEpisodes.utils.js.  Without this index Supabase/PostgREST returns
-- a 400 Bad Request when the client calls .upsert(..., { onConflict: ... }).
-- episode_id is NOT part of the conflict key — it is only a data column.
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_unique_per_user_anime_episode;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_unique_per_user_anime_episode
  UNIQUE (user_id, anime_id, episode_num, notification_type);
