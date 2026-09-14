-- Migration: Add avatar_url column to batches table for group chat profile picture
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.batches.avatar_url IS 'Public image URL for batch group chat avatar/DP';
