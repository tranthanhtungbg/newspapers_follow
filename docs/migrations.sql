-- =============================================================
-- LingoReader — Database Migration Scripts
-- PostgreSQL 16+
-- Run in order: V001 → V002 → V003 → V004 → V005
-- =============================================================

-- =============================================================
-- V001__create_enums_and_extensions.sql
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- accent-insensitive search

CREATE TYPE user_role AS ENUM ('GUEST', 'USER', 'ADMIN', 'MODERATOR');
CREATE TYPE resource_type AS ENUM ('article', 'youtube', 'pdf', 'other');
CREATE TYPE backup_status AS ENUM ('pending', 'running', 'success', 'failed');

-- =============================================================
-- V002__create_core_tables.sql
-- =============================================================

-- Languages (config table — add new lang = just insert a row)
CREATE TABLE languages (
  code         VARCHAR(10)  PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  native_name  VARCHAR(100) NOT NULL,
  flag_emoji   VARCHAR(10),
  is_rtl       BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order   SMALLINT     NOT NULL DEFAULT 100
);

INSERT INTO languages (code, name, native_name, flag_emoji, sort_order) VALUES
  ('en', 'English',   'English',    '🇬🇧', 1),
  ('vi', 'Vietnamese','Tiếng Việt', '🇻🇳', 2),
  ('ja', 'Japanese',  '日本語',     '🇯🇵', 3),
  ('ko', 'Korean',    '한국어',     '🇰🇷', 4),
  ('fr', 'French',    'Français',   '🇫🇷', 5),
  ('es', 'Spanish',   'Español',    '🇪🇸', 6),
  ('de', 'German',    'Deutsch',    '🇩🇪', 7);

-- Users
CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),                         -- NULL for OAuth-only users
  name          VARCHAR(255) NOT NULL,
  avatar        VARCHAR(500),
  role          user_role    NOT NULL DEFAULT 'USER',
  source_lang   VARCHAR(10)  NOT NULL DEFAULT 'en' REFERENCES languages(code),
  target_lang   VARCHAR(10)  NOT NULL DEFAULT 'vi' REFERENCES languages(code),
  reminder_time TIME,
  reminder_tz   VARCHAR(100) NOT NULL DEFAULT 'UTC',
  streak_count  INTEGER      NOT NULL DEFAULT 0,
  last_active   TIMESTAMPTZ,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- OAuth accounts (supports Google, GitHub, extensible)
CREATE TABLE oauth_accounts (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    VARCHAR(50)  NOT NULL,                  -- 'google' | 'github'
  provider_id VARCHAR(255) NOT NULL,
  email       VARCHAR(255),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Refresh tokens (rotation + revocation)
CREATE TABLE refresh_tokens (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) UNIQUE NOT NULL,           -- bcrypt hash of token
  expires_at  TIMESTAMPTZ  NOT NULL,
  revoked_at  TIMESTAMPTZ,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================
-- V003__create_content_tables.sql
-- =============================================================

-- Article cache (avoid re-scraping)
CREATE TABLE cached_articles (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  url_hash    VARCHAR(64)  UNIQUE NOT NULL,            -- SHA-256 of normalized URL
  url         VARCHAR(2000) NOT NULL,
  title       VARCHAR(500),
  content     TEXT         NOT NULL,
  lang        VARCHAR(10)  REFERENCES languages(code),
  metadata    JSONB        NOT NULL DEFAULT '{}',      -- { author, publishedAt, image, description }
  reading_time_minutes INTEGER,
  cached_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ  NOT NULL
);

-- Vocabulary items
CREATE TABLE vocabulary_items (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word             VARCHAR(500) NOT NULL,
  translation      TEXT         NOT NULL,
  ipa              VARCHAR(500),
  context_sentence TEXT,
  context_url      VARCHAR(2000),
  context_title    VARCHAR(500),
  part_of_speech   VARCHAR(50),
  examples         JSONB        NOT NULL DEFAULT '[]', -- [{ en, targetLang }]
  collocations     JSONB        NOT NULL DEFAULT '[]', -- ["phrase1", ...]
  tags             TEXT[]       NOT NULL DEFAULT '{}',
  source_lang      VARCHAR(10)  NOT NULL REFERENCES languages(code),
  target_lang      VARCHAR(10)  NOT NULL REFERENCES languages(code),
  is_pinned        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_mastered      BOOLEAN      NOT NULL DEFAULT FALSE,
  difficulty       SMALLINT     NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  review_count     INTEGER      NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  notes            TEXT,
  audio_url        VARCHAR(500),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Spaced repetition sessions (SM-2 algorithm per vocabulary item per user)
CREATE TABLE flashcard_sessions (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_id         UUID         NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  score            SMALLINT     NOT NULL CHECK (score BETWEEN 0 AND 5),
  ease_factor      FLOAT        NOT NULL DEFAULT 2.5,
  interval_days    INTEGER      NOT NULL DEFAULT 1,
  next_review_date DATE         NOT NULL DEFAULT CURRENT_DATE,
  review_history   JSONB        NOT NULL DEFAULT '[]',  -- [{ date, score, durationMs }]
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);

-- Pinned vocabulary (sticky note overlay)
CREATE TABLE pinned_vocabulary (
  user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_id      UUID         NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
  display_order SMALLINT     NOT NULL DEFAULT 0,
  color         VARCHAR(20)  NOT NULL DEFAULT 'yellow',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, vocab_id)
);

-- Constraint: max 10 pins per user (enforced via trigger)
CREATE OR REPLACE FUNCTION check_pin_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM pinned_vocabulary WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum 10 pinned vocabulary items allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_pin_limit
  BEFORE INSERT ON pinned_vocabulary
  FOR EACH ROW EXECUTE FUNCTION check_pin_limit();

-- Saved resources (user library)
CREATE TABLE saved_resources (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url         VARCHAR(2000) NOT NULL,
  type        resource_type NOT NULL DEFAULT 'article',
  title       VARCHAR(500),
  thumbnail   VARCHAR(500),
  description TEXT,
  tags        TEXT[]        NOT NULL DEFAULT '{}',
  folder      VARCHAR(255),
  notes       TEXT,
  is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
  is_favorite BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- V004__create_system_tables.sql
-- =============================================================

-- Audit log (every sensitive action)
CREATE TABLE audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(100) NOT NULL,   -- 'auth.login', 'vocab.save', 'admin.backup'
  resource    VARCHAR(100),            -- 'vocabulary_item', 'user', ...
  resource_id UUID,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  meta        JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- System backups (admin-managed)
CREATE TABLE system_backups (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      VARCHAR(255)  NOT NULL,
  storage_path  VARCHAR(500)  NOT NULL,
  size_bytes    BIGINT,
  status        backup_status NOT NULL DEFAULT 'pending',
  triggered_by  UUID          REFERENCES users(id) ON DELETE SET NULL,
  error_message TEXT,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- TTS audio cache (avoid regenerating same audio)
CREATE TABLE tts_cache (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash   VARCHAR(64)  UNIQUE NOT NULL,  -- SHA-256 of (text + lang + voice)
  text        TEXT         NOT NULL,
  lang        VARCHAR(10)  NOT NULL REFERENCES languages(code),
  voice       VARCHAR(100) NOT NULL DEFAULT 'default',
  audio_url   VARCHAR(500) NOT NULL,
  duration_ms INTEGER,
  provider    VARCHAR(50)  NOT NULL DEFAULT 'google',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =============================================================
-- V005__create_indexes_and_triggers.sql
-- =============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;

-- Vocabulary
CREATE INDEX idx_vocab_user_id ON vocabulary_items(user_id);
CREATE INDEX idx_vocab_created ON vocabulary_items(user_id, created_at DESC);
CREATE INDEX idx_vocab_tags ON vocabulary_items USING GIN(tags);
CREATE INDEX idx_vocab_source_target ON vocabulary_items(user_id, source_lang, target_lang);
CREATE INDEX idx_vocab_pinned ON vocabulary_items(user_id) WHERE is_pinned = TRUE;
CREATE INDEX idx_vocab_mastered ON vocabulary_items(user_id) WHERE is_mastered = FALSE;

-- Full-text search on vocabulary word + translation
CREATE INDEX idx_vocab_fts ON vocabulary_items
  USING GIN(to_tsvector('english', word || ' ' || translation));

-- Flashcard sessions (spaced repetition queries)
CREATE INDEX idx_flashcard_next_review ON flashcard_sessions(user_id, next_review_date);
CREATE INDEX idx_flashcard_ease ON flashcard_sessions(user_id, ease_factor);

-- Article cache
CREATE INDEX idx_cached_articles_hash ON cached_articles(url_hash);
CREATE INDEX idx_cached_articles_expires ON cached_articles(expires_at);

-- Saved resources
CREATE INDEX idx_resources_user ON saved_resources(user_id, created_at DESC);
CREATE INDEX idx_resources_type ON saved_resources(user_id, type);
CREATE INDEX idx_resources_tags ON saved_resources USING GIN(tags);
CREATE INDEX idx_resources_unread ON saved_resources(user_id) WHERE is_read = FALSE;

-- OAuth
CREATE INDEX idx_oauth_user ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_provider ON oauth_accounts(provider, provider_id);

-- Refresh tokens
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- Audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- TTS cache
CREATE INDEX idx_tts_hash ON tts_cache(text_hash);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vocabulary_updated_at
  BEFORE UPDATE ON vocabulary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER flashcard_updated_at
  BEFORE UPDATE ON flashcard_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON saved_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- V006__seed_data.sql (Development only)
-- =============================================================

-- Admin user (password: Admin@123456 — CHANGE IN PRODUCTION)
INSERT INTO users (id, email, password_hash, name, role) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@lingoreader.io',
  '$2b$12$placeholder_hash_change_before_use',
  'System Admin',
  'ADMIN'
) ON CONFLICT DO NOTHING;
