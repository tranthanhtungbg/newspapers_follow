-- =============================================================
-- V007__add_appearance_settings.sql
-- Add appearance_settings JSONB column to users table
-- Syncs theme/font preferences for authenticated users across devices
-- =============================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS appearance_settings JSONB NOT NULL DEFAULT '{
    "theme": "system",
    "fontSize": "base",
    "fontFamily": "serif",
    "lineHeight": "relaxed",
    "readingWidth": "normal"
  }'::jsonb;

-- Index for potential future filtering/analytics
COMMENT ON COLUMN users.appearance_settings IS
  'User UI preferences: theme (light|dark|system), fontSize, fontFamily, lineHeight, readingWidth';
