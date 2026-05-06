# LingoReader — Full System Specification

> **Version:** 1.0.0  
> **Stack:** Next.js 14 · NestJS · PostgreSQL · Redis · BullMQ  
> **Focus:** English-first, multi-language extensible  
> **Last updated:** 2025

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Role System (RBAC)](#3-role-system-rbac)
4. [Feature Specifications](#4-feature-specifications)
   - [Group A — Guest + User](#group-a--guest--user-unauthenticated-accessible)
   - [Group B — Authenticated User](#group-b--user-only-requires-authentication)
   - [Group C — Admin Panel](#group-c--admin-panel)
5. [Database Schema](#5-database-schema)
6. [API Standards](#6-api-response-standards)
7. [SEO Requirements](#7-seo-requirements)
8. [Security Requirements](#8-security-requirements)
9. [Extensibility Guidelines](#9-extensibility-guidelines)
10. [Development Conventions](#10-development-conventions)
11. [Environment Variables](#11-environment-variables)
12. [Deployment](#12-deployment)

---

## 1. Project Overview

**LingoReader** is a web application that enables users to learn foreign languages by consuming real-world content — news articles, documentation, any URL-based content.

The core concept is **Comprehensible Input Learning**: users read content slightly above their current level, with AI-powered contextual translation, vocabulary saving, and spaced-repetition review baked directly into the reading experience.

### Core Value Proposition

| Problem | LingoReader Solution |
|---|---|
| Dictionary translations lack context | AI translates with surrounding paragraph context |
| Vocabulary forgotten after reading | One-click save → spaced repetition flashcards |
| No connection between reading & study | Vocabulary sourced directly from real articles |
| Learning feels like studying | Learning embedded in genuine content consumption |

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, React Query |
| Backend | NestJS (modular), TypeScript, Prisma ORM |
| Database | PostgreSQL (primary), Redis (cache + sessions + queues) |
| Queue | BullMQ (TTS jobs, reminders, scheduled backup) |
| Storage | S3-compatible (audio files, backup dumps) |
| AI | OpenAI GPT-4o or Claude API |
| TTS | Google Cloud TTS or ElevenLabs |
| Auth | JWT + Refresh Token rotation + OAuth2 (Google, GitHub) |
| Logging | Winston + Sentry |
| SEO | next-seo, sitemap.xml, JSON-LD |
| Deployment | Docker Compose → Kubernetes-ready, GitHub Actions CI/CD |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Client Layer — Next.js 14 (App Router)          │
│         SSR · SEO · Responsive · PWA · i18n ready           │
├──────────────┬──────────────┬──────────────┬────────────────┤
│    Reader    │  Translator  │  Vocabulary  │   Learn Hub    │
│ URL · render │ Word · Page  │ Save · Card  │ Audio · Guide  │
└──────────────┴──────┬───────┴──────────────┴────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│          API Gateway — NestJS (REST + WebSocket)             │
│      JWT Auth · Rate Limit · CORS · Logger · Helmet         │
├──────┬────────┬─────────┬──────────┬──────┬────────┬───────┤
│ Auth │Scraper │Translate│Vocabulary│  TTS │Remind  │ Admin │
└──────┴────────┴─────────┴──────────┴──────┴────────┴───────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────▼──────┐      ┌─────────▼──────┐      ┌────────▼──────┐
│ PostgreSQL  │      │     Redis       │      │  S3 Storage   │
│ Primary DB  │      │ Cache·Session  │      │ Audio·Backup  │
└─────────────┘      └────────────────┘      └───────────────┘
                               │
                      ┌────────▼────────┐
                      │  BullMQ Queues  │
                      │ TTS·Remind·Bkup │
                      └─────────────────┘
```

---

## 3. Role System (RBAC)

Roles are stored in the database and enforced via NestJS `@Roles()` decorator + `RolesGuard`.

| Role | Description | Scope |
|---|---|---|
| `GUEST` | Unauthenticated visitor | Features A1–A4 (read-only, rate-limited) |
| `USER` | Authenticated end-user | All A + B features |
| `ADMIN` | System administrator | All features + C panel |
| `MODERATOR` | Reserved, schema-ready | Future use — inactive |

All routes protected via `JwtAuthGuard + RolesGuard`. Admin routes prefixed `/admin/*`.

---

## 4. Feature Specifications

### Group A — Guest + User (Unauthenticated accessible)

---

#### A1 — Content Reader (URL Fetcher)

**Description:** User pastes any public URL. System fetches, parses, and renders clean readable content.

**Behavior:**
- Accept any public URL: news, docs, blogs, Wikipedia, Medium
- Backend scrapes via Puppeteer (JS-rendered sites) with Cheerio fallback
- Strip ads, navigation, footers — return readable content only
- Render in distraction-free reading mode (font, spacing, dark mode)
- Cache scraped content in Redis (TTL: 1 hour)
- If paywall detected → show notice, offer cached version if available
- SEO: dynamic `og:title`, `og:description` from article metadata

**API:**
```
POST /reader/fetch
Body: { url: string }
Returns: { title, content, lang, metadata, readingTime, articleId }
```

**Rate limit:** 20 requests/hour per IP (Redis sliding window)

---

#### A2 — Contextual Translation

**Description:** Translate selected words, phrases, or full page with context-aware AI.

**Modes:**
- **Hover mode:** Mouseover word → tooltip (translation + IPA)
- **Select mode:** Highlight phrase/sentence → popover with full context analysis
- **Full page mode:** Translate entire article preserving layout structure

**AI Prompt Template (MUST follow this structure):**
```
Translate the following [SOURCE_LANG] text to [TARGET_LANG].

Context paragraph: """[SURROUNDING_PARAGRAPH]"""
Target text: """[SELECTED_TEXT]"""

Respond ONLY in JSON (no markdown, no preamble):
{
  "translation": "string",
  "partOfSpeech": "noun|verb|adj|adv|phrase|other",
  "ipa": "/pronunciation/",
  "contextMeaning": "meaning specific to this context",
  "alternativeMeanings": ["meaning2", "meaning3"],
  "examples": [
    { "en": "example sentence in English", "vi": "Vietnamese translation" }
  ],
  "collocations": ["common phrase 1", "common phrase 2"],
  "register": "formal|informal|neutral|technical"
}
```

**Language support (config-driven via `languages` table):**
English, Vietnamese, Japanese, Korean, French, Spanish, German — extensible without code change.

**API:**
```
POST /translation/contextual
Body: { text, sourceLang, targetLang, contextParagraph, articleId? }
Returns: TranslationResult (JSON per template above)
```

**Rate limit:** 60 requests/minute per IP

---

#### A3 — Article Summarizer

**Description:** One-click AI summary of any fetched article at three detail levels.

**Output levels:**
- **Brief:** 3-sentence executive summary
- **Medium:** 1-paragraph overview
- **Detailed:** Structured full summary with key points

**AI Prompt Template:**
```
Summarize the following article in [TARGET_LANG].
Article: """[ARTICLE_CONTENT]"""

Return ONLY JSON:
{
  "brief": "3-sentence summary",
  "medium": "1-paragraph summary (150-200 words)",
  "detailed": "full structured summary",
  "keyPoints": ["point1", "point2", "point3"],
  "entities": ["person/place/org names mentioned"],
  "tags": ["topic", "category", "subtopic"],
  "sentiment": "positive|negative|neutral",
  "readingLevel": "beginner|intermediate|advanced"
}
```

**API:**
```
POST /reader/summarize
Body: { articleId, targetLang, level: "brief|medium|detailed" }
```

---

#### A4 — Multi-Language Switcher

**Description:** UI to switch source/target language pair across the entire app.

- Language config in DB table `languages` — add new language with zero code change
- Persisted in cookie for guests, in user profile for authenticated users
- Auto-detect article source language via `franc` or AI inference
- UI: flag + name dropdown in top navigation

---

### Group B — User Only (Requires authentication)

---

#### B1 — Vocabulary Save System

**Description:** Save words/phrases encountered during reading with full context.

**Data captured on save:**
- Word or phrase
- IPA pronunciation
- Translation + context-specific meaning
- Source sentence (context)
- Source URL + article title
- Part of speech
- AI-generated examples
- User-added notes and tags

**Vocabulary Dashboard:**
- Search by word/translation
- Filter: tag, source language, date range, mastery level
- Sort: date added, review count, difficulty
- Bulk actions: tag, delete, export CSV

**API:**
```
POST   /vocabulary              — save item
GET    /vocabulary              — list (paginated, filterable)
GET    /vocabulary/:id          — single item
PATCH  /vocabulary/:id          — update (notes, tags, mastered)
DELETE /vocabulary/:id          — delete
POST   /vocabulary/bulk-delete  — bulk delete
GET    /vocabulary/export       — CSV export
```

---

#### B2 — Flashcard System (Spaced Repetition)

**Description:** Review saved vocabulary via SM-2 spaced repetition algorithm.

**Study modes:**
- **Classic flip:** Front (word + IPA) → Back (translation + example)
- **Multiple choice:** AI generates 3 distractors from user's own vocabulary

**SM-2 Algorithm:**
- User rates recall: `0` (blackout) to `5` (perfect)
- Ease factor and interval calculated per item
- Items due today surfaced first

**Session tracking:** correct / incorrect / skipped per card per session

**API:**
```
GET  /flashcards/due-today          — items due for review
POST /flashcards/:id/review         — Body: { score: 0-5 }
GET  /flashcards/stats              — progress stats
POST /flashcards/session/start      — start session
POST /flashcards/session/end        — end + save session
```

---

#### B3 — Reminder & Notification System

**Description:** Daily vocabulary review reminders with random selection.

**Behavior:**
- User configures: time, timezone, enabled/disabled
- BullMQ cron job fires per user schedule
- Selects 5 vocabulary items: weighted by low review count + high difficulty
- Channels: email (Nodemailer) + Web Push
- Streak tracking: consecutive days with review completed

**API:**
```
PATCH /user/reminder-settings
Body: { time: "HH:MM", timezone: "Asia/Ho_Chi_Minh", enabled: boolean }

GET /user/streak
```

---

#### B4 — Text-to-Speech + Pronunciation

**Description:** Audio playback for words, sentences, and example phrases.

**Features:**
- Generate audio: word → sentence → example
- Provider: Google Cloud TTS (primary) / ElevenLabs (premium)
- Cache audio in S3 by hash of `(text + lang + voice)` — never regenerate same audio
- IPA symbols rendered with web font
- Speed control: 0.5x / 1.0x / 1.5x (client-side via Web Audio API)

**API:**
```
POST /tts/generate
Body: { text, lang, voice?, speed? }
Returns: { audioUrl, duration, cached: boolean }
```

---

#### B5 — Sticky Note Vocabulary Pins

**Description:** Pin up to 10 vocabulary items as floating sticky notes during reading.

**Behavior:**
- Persistent overlay (bottom-right, collapsible)
- Visible while reading any article
- Drag to reorder
- Click to flip (show translation)
- Color-coded by tag

**API:**
```
POST   /vocabulary/:id/pin
DELETE /vocabulary/:id/pin
PATCH  /vocabulary/pins/reorder   Body: { orderedIds: string[] }
GET    /vocabulary/pins           Returns: pinned items in order
```

**Limit:** 10 pins per user

---

#### B6 — Resource Library

**Description:** Bookmark articles, YouTube videos, and documents for later.

**Supported types:** `article | youtube | pdf | other`

**Features:**
- Save URL with auto-fetched title + thumbnail
- Organize with tags and custom folders
- Mark read / unread / favorite
- YouTube: embed player in app
- Filter + search saved resources

**API:**
```
POST   /library
GET    /library?type=&tag=&folder=&status=&page=
PATCH  /library/:id
DELETE /library/:id
POST   /library/folders
```

---

#### B7 — Learning Guide Pages

**Description:** Static educational content for English learners.

**Pages (Next.js SSG for SEO):**
- `/learn/phonetics` — IPA chart, interactive pronunciation guide
- `/learn/phrases` — Daily phrases (greetings, travel, business, social)
- `/learn/grammar` — Quick-reference grammar cards
- `/learn/alphabet` — English alphabet with sounds

Content stored in MDX files, structured for CMS migration if needed.

---

### Group C — Admin Panel

---

#### C1 — User Management

- List, search, filter all users
- Change roles (USER ↔ ADMIN)
- Suspend / activate accounts
- View per-user stats: vocabulary count, active streak, last login
- Impersonate user (for support, with audit log)

**API prefix:** `/admin/users/*`

---

#### C2 — Backup System

**Schedule:** BullMQ cron — daily 02:00 UTC

**Backup scope:**
- PostgreSQL full dump via `pg_dump` → gzipped
- S3 files manifest

**Storage:** S3 path `backups/YYYY/MM/backup_YYYYMMDD_HHmmss.sql.gz`

**Retention policy:**
- Daily backups: keep last 30
- Monthly backups: keep last 12
- Annual backups: keep last 5

**Restore flow:** Admin triggers → confirmation dialog → restore job queued → status webhook

**API:**
```
POST /admin/backup/trigger
GET  /admin/backup/list
GET  /admin/backup/:id/download
POST /admin/backup/:id/restore
GET  /admin/backup/status
```

---

#### C3 — Logging & Error Tracing

**Winston structured log fields:**
```json
{
  "level": "info|warn|error|debug",
  "timestamp": "ISO 8601",
  "correlationId": "uuid-v4",
  "userId": "string|null",
  "method": "GET|POST|...",
  "path": "/api/...",
  "statusCode": 200,
  "durationMs": 142,
  "message": "human-readable message",
  "meta": {}
}
```

**NestJS components:**
- `LoggerMiddleware` — every incoming request
- `LoggingInterceptor` — response + timing
- `HttpExceptionFilter` — standardized error shape
- `CorrelationIdMiddleware` — inject UUID, propagate to all services

**Sentry:** Capture unhandled exceptions + performance traces

**Log rotation:** Daily files, 30-day retention, compressed archives

**Admin log viewer:** Filter by level, date range, userId, path, correlationId

---

#### C4 — System Health Dashboard

| Metric | Source |
|---|---|
| API uptime + response times | Winston metrics aggregation |
| Database connections | pg pool stats |
| Redis cache hit rate | Redis INFO command |
| Queue job stats | BullMQ dashboard |
| Active users (last 24h) | DB query |

---

## 5. Database Schema

### Core Tables

```sql
-- Users
users {
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  email         VARCHAR(255) UNIQUE NOT NULL
  password_hash VARCHAR(255)                        -- null for OAuth users
  name          VARCHAR(255) NOT NULL
  avatar        VARCHAR(500)
  role          user_role DEFAULT 'USER'            -- GUEST|USER|ADMIN|MODERATOR
  source_lang   VARCHAR(10) DEFAULT 'en'
  target_lang   VARCHAR(10) DEFAULT 'vi'
  reminder_time TIME
  reminder_tz   VARCHAR(100) DEFAULT 'UTC'
  streak_count  INTEGER DEFAULT 0
  last_active   TIMESTAMPTZ
  is_active     BOOLEAN DEFAULT TRUE
  created_at    TIMESTAMPTZ DEFAULT NOW()
  updated_at    TIMESTAMPTZ DEFAULT NOW()
}

-- Vocabulary
vocabulary_items {
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE
  word             VARCHAR(500) NOT NULL
  translation      TEXT NOT NULL
  ipa              VARCHAR(500)
  context_sentence TEXT
  context_url      VARCHAR(2000)
  context_title    VARCHAR(500)
  part_of_speech   VARCHAR(50)
  examples         JSONB DEFAULT '[]'
  collocations     JSONB DEFAULT '[]'
  tags             TEXT[] DEFAULT '{}'
  source_lang      VARCHAR(10) NOT NULL
  target_lang      VARCHAR(10) NOT NULL
  is_pinned        BOOLEAN DEFAULT FALSE
  is_mastered      BOOLEAN DEFAULT FALSE
  difficulty       SMALLINT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5)
  review_count     INTEGER DEFAULT 0
  last_reviewed_at TIMESTAMPTZ
  created_at       TIMESTAMPTZ DEFAULT NOW()
}

-- Spaced Repetition
flashcard_sessions {
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE
  vocab_id         UUID REFERENCES vocabulary_items(id) ON DELETE CASCADE
  score            SMALLINT CHECK (score BETWEEN 0 AND 5)
  ease_factor      FLOAT DEFAULT 2.5
  interval_days    INTEGER DEFAULT 1
  next_review_date DATE DEFAULT CURRENT_DATE
  review_history   JSONB DEFAULT '[]'
  created_at       TIMESTAMPTZ DEFAULT NOW()
  updated_at       TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(user_id, vocab_id)
}

-- Pinned vocabulary
pinned_vocabulary {
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE
  vocab_id      UUID REFERENCES vocabulary_items(id) ON DELETE CASCADE
  display_order SMALLINT NOT NULL DEFAULT 0
  color         VARCHAR(20) DEFAULT 'yellow'
  created_at    TIMESTAMPTZ DEFAULT NOW()
  PRIMARY KEY (user_id, vocab_id)
}

-- Saved Resources (Library)
saved_resources {
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE
  url         VARCHAR(2000) NOT NULL
  type        resource_type NOT NULL               -- article|youtube|pdf|other
  title       VARCHAR(500)
  thumbnail   VARCHAR(500)
  description TEXT
  tags        TEXT[] DEFAULT '{}'
  folder      VARCHAR(255)
  notes       TEXT
  is_read     BOOLEAN DEFAULT FALSE
  is_favorite BOOLEAN DEFAULT FALSE
  created_at  TIMESTAMPTZ DEFAULT NOW()
}

-- Article cache
cached_articles {
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  url_hash    VARCHAR(64) UNIQUE NOT NULL           -- SHA-256 of normalized URL
  url         VARCHAR(2000) NOT NULL
  title       VARCHAR(500)
  content     TEXT NOT NULL
  lang        VARCHAR(10)
  metadata    JSONB DEFAULT '{}'
  cached_at   TIMESTAMPTZ DEFAULT NOW()
  expires_at  TIMESTAMPTZ NOT NULL
}

-- Language config (extensible)
languages {
  code         VARCHAR(10) PRIMARY KEY              -- 'en', 'vi', 'ja'
  name         VARCHAR(100) NOT NULL               -- 'English'
  native_name  VARCHAR(100) NOT NULL               -- 'Tiếng Anh'
  flag_emoji   VARCHAR(10)
  is_rtl       BOOLEAN DEFAULT FALSE
  is_active    BOOLEAN DEFAULT TRUE
  sort_order   SMALLINT DEFAULT 100
}

-- Audit log
audit_logs {
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL
  action      VARCHAR(100) NOT NULL               -- 'login', 'vocab.save', ...
  resource    VARCHAR(100)
  resource_id UUID
  ip_address  VARCHAR(45)
  user_agent  TEXT
  meta        JSONB DEFAULT '{}'
  created_at  TIMESTAMPTZ DEFAULT NOW()
}

-- Backup records
system_backups {
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
  filename      VARCHAR(255) NOT NULL
  storage_path  VARCHAR(500) NOT NULL
  size_bytes    BIGINT
  status        backup_status DEFAULT 'pending'   -- pending|running|success|failed
  triggered_by  UUID REFERENCES users(id)
  error_message TEXT
  completed_at  TIMESTAMPTZ
  created_at    TIMESTAMPTZ DEFAULT NOW()
}

-- OAuth providers
oauth_accounts {
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE
  provider    VARCHAR(50) NOT NULL               -- 'google', 'github'
  provider_id VARCHAR(255) NOT NULL
  created_at  TIMESTAMPTZ DEFAULT NOW()
  UNIQUE(provider, provider_id)
}

-- Refresh tokens
refresh_tokens {
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE
  token_hash  VARCHAR(255) UNIQUE NOT NULL
  expires_at  TIMESTAMPTZ NOT NULL
  revoked_at  TIMESTAMPTZ
  created_at  TIMESTAMPTZ DEFAULT NOW()
}
```

### Indexes

```sql
CREATE INDEX idx_vocab_user_id ON vocabulary_items(user_id);
CREATE INDEX idx_vocab_tags ON vocabulary_items USING GIN(tags);
CREATE INDEX idx_vocab_created ON vocabulary_items(user_id, created_at DESC);
CREATE INDEX idx_flashcard_next_review ON flashcard_sessions(user_id, next_review_date);
CREATE INDEX idx_cached_articles_hash ON cached_articles(url_hash);
CREATE INDEX idx_cached_articles_expires ON cached_articles(expires_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_resources_user ON saved_resources(user_id, created_at DESC);
```

---

## 6. API Response Standards

### Success
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VOCAB_NOT_FOUND",
    "message": "Vocabulary item not found",
    "details": null,
    "correlationId": "uuid-v4"
  }
}
```

### HTTP Status Conventions

| Status | Usage |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Forbidden (insufficient role) |
| `404` | Not found |
| `422` | Unprocessable entity |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## 7. SEO Requirements

- `generateMetadata()` per page with dynamic title + description
- OpenGraph tags for all reader and guide pages
- JSON-LD structured data on learning guide pages (`Course`, `Article` schemas)
- `sitemap.xml` — auto-generated, excludes `/admin/*` and `/api/*`
- `robots.txt` — allow all except admin paths
- Canonical URLs on all pages
- `next/image` for all images (auto WebP, lazy loading)
- Core Web Vitals targets: LCP < 2.5s · FID < 100ms · CLS < 0.1

---

## 8. Security Requirements

| Layer | Implementation |
|---|---|
| HTTP headers | Helmet.js (NestJS) |
| CORS | Whitelist allowed origins via env config |
| JWT | Access token 15min + Refresh token 7 days (rotation on use) |
| Password | bcrypt (rounds: 12) |
| Input validation | `class-validator` on all DTOs |
| SQL injection | Prisma parameterized queries |
| XSS | DOMPurify on scraped HTML before render |
| CSRF | SameSite=Strict cookies + CSRF token header for mutations |
| Rate limiting | Redis sliding window (per IP + per authenticated user) |
| Secrets | Never in code — env vars only (dotenv + vault-ready) |
| Audit trail | All sensitive actions logged to `audit_logs` |

---

## 9. Extensibility Guidelines

### Add a new language

1. Insert row into `languages` table
2. Add locale folder for `next-intl` UI strings
3. Zero backend code changes required

### Add a new user role

1. Add value to `user_role` enum via DB migration
2. Add `@Roles('NEW_ROLE')` decorator to relevant endpoints
3. No structural NestJS changes required

### Add a new content type (PDF, EPUB)

1. Add value to `resource_type` enum
2. Create parser module implementing `ContentParser` interface
3. Register in `ParserFactory`

---

## 10. Development Conventions

### NestJS Modules (Feature-based)

```
AuthModule · ReaderModule · TranslationModule · VocabularyModule
FlashcardModule · TtsModule · NotificationModule · LibraryModule · AdminModule
```

### File Naming

- Files: `kebab-case` — `user.service.ts`, `create-user.dto.ts`
- Classes: `PascalCase` — `UserService`, `CreateUserDto`
- Constants: `SCREAMING_SNAKE` — `JWT_SECRET`
- Database tables: `snake_case`

### Code Standards

- All service methods log via `winston` with correlation ID
- All API inputs validated via `class-validator` DTOs
- All errors handled with custom exceptions extending `BaseException`
- No `any` types in TypeScript
- Migrations via Prisma (never `prisma db push` in production)

### Testing

- Jest unit tests per service (mock all dependencies)
- e2e tests via Supertest for all critical API paths
- Test database: separate PostgreSQL instance

---

## 11. Environment Variables

```bash
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lingoreader
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# TTS
GOOGLE_TTS_API_KEY=
ELEVENLABS_API_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=lingoreader-storage
S3_BACKUP_BUCKET=lingoreader-backups

# Sentry
SENTRY_DSN=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@lingoreader.io

# Web Push
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

---

## 12. Deployment

### Docker Compose (Development)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: lingoreader
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    depends_on: [postgres, redis]
    ports: ["3001:3001"]

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["3000:3000"]
```

### CI/CD (GitHub Actions)

1. `lint` → `test` → `build` on every PR
2. `deploy-staging` on merge to `develop`
3. `deploy-production` on merge to `main` (requires manual approval)

### Production Checklist

- [ ] All env vars set in secret manager
- [ ] Database migrations run before deployment
- [ ] Redis persistence enabled (`appendonly yes`)
- [ ] S3 bucket versioning enabled for backups
- [ ] Sentry DSN configured
- [ ] CORS origins whitelist updated
- [ ] Rate limits tuned for production traffic
- [ ] SSL/TLS via load balancer or nginx
- [ ] Health check endpoint: `GET /health`

---

*LingoReader Specification — maintained by engineering team*  
*For questions: open an issue in the project repository*
