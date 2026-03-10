-- Add status column to watchlists table
ALTER TABLE public.watchlists
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'plan_to_watch'
    CHECK (status IN ('watching', 'plan_to_watch', 'completed', 'on_hold', 'dropped'));

-- Allow users to update their own watchlist items (needed for status changes)
CREATE POLICY "Users can update their own watchlist items"
ON public.watchlists
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
