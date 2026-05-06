# LingoReader — Next.js 14 Component Architecture

> App Router · TypeScript · TailwindCSS · Zustand · React Query

---

## Directory Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (public)/                 # Guest-accessible routes
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── reader/
│   │   │   │   └── page.tsx          # Main reader page
│   │   │   ├── learn/
│   │   │   │   ├── phonetics/page.tsx
│   │   │   │   ├── phrases/page.tsx
│   │   │   │   └── grammar/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (auth)/                   # Auth routes
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (dashboard)/              # Authenticated routes
│   │   │   ├── vocabulary/page.tsx
│   │   │   ├── flashcards/page.tsx
│   │   │   ├── library/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── layout.tsx            # Dashboard shell with sidebar
│   │   ├── admin/                    # Admin panel
│   │   │   ├── page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── backups/page.tsx
│   │   │   ├── logs/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                      # API routes (Next.js)
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx                # Root layout
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── reader/                   # Article reader components
│   │   │   ├── UrlInput.tsx
│   │   │   ├── ArticleRenderer.tsx
│   │   │   ├── ReadingModeToggle.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── ReadingProgress.tsx
│   │   ├── translation/              # Translation overlay components
│   │   │   ├── TranslationPopover.tsx
│   │   │   ├── HoverTranslation.tsx
│   │   │   ├── SelectionTranslation.tsx
│   │   │   ├── TranslationCard.tsx
│   │   │   └── FullPageTranslation.tsx
│   │   ├── vocabulary/               # Vocabulary management
│   │   │   ├── VocabularyList.tsx
│   │   │   ├── VocabularyCard.tsx
│   │   │   ├── SaveVocabularyButton.tsx
│   │   │   ├── VocabularyFilters.tsx
│   │   │   └── VocabularySearch.tsx
│   │   ├── flashcard/                # Flashcard study
│   │   │   ├── FlashcardDeck.tsx
│   │   │   ├── FlashcardItem.tsx
│   │   │   ├── FlashcardProgress.tsx
│   │   │   ├── RatingButtons.tsx
│   │   │   └── StudySession.tsx
│   │   ├── pins/                     # Sticky note pins
│   │   │   ├── PinOverlay.tsx
│   │   │   ├── PinNote.tsx
│   │   │   └── PinList.tsx
│   │   ├── audio/                    # TTS components
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── PronunciationButton.tsx
│   │   │   └── SpeedControl.tsx
│   │   ├── summary/                  # Article summary
│   │   │   ├── SummaryPanel.tsx
│   │   │   └── SummaryLevelSelector.tsx
│   │   ├── library/                  # Resource library
│   │   │   ├── LibraryGrid.tsx
│   │   │   ├── ResourceCard.tsx
│   │   │   └── AddResourceModal.tsx
│   │   ├── admin/                    # Admin components
│   │   │   ├── UserTable.tsx
│   │   │   ├── BackupList.tsx
│   │   │   ├── LogViewer.tsx
│   │   │   └── SystemHealthCard.tsx
│   │   └── ui/                       # Design system primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Toast.tsx
│   │       └── Popover.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useTranslation.ts
│   │   ├── useTextSelection.ts
│   │   ├── useVocabulary.ts
│   │   ├── useFlashcards.ts
│   │   ├── useAudio.ts
│   │   ├── usePins.ts
│   │   └── useReader.ts
│   │
│   ├── stores/                       # Zustand global state
│   │   ├── reader.store.ts
│   │   ├── vocabulary.store.ts
│   │   ├── language.store.ts
│   │   └── ui.store.ts
│   │
│   ├── lib/                          # Utilities
│   │   ├── api.ts                    # API client (axios instance)
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── query-client.ts           # React Query setup
│   │   └── utils.ts
│   │
│   └── types/                        # TypeScript types
│       ├── vocabulary.types.ts
│       ├── reader.types.ts
│       ├── translation.types.ts
│       └── api.types.ts
│
├── public/
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Key Component Implementations

---

### `components/reader/ArticleRenderer.tsx`

The core component — renders article content with translation hooks attached.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTextSelection } from '@/hooks/useTextSelection';
import { SelectionTranslation } from '@/components/translation/SelectionTranslation';
import { HoverTranslation } from '@/components/translation/HoverTranslation';
import { ReadingProgress } from './ReadingProgress';
import type { Article } from '@/types/reader.types';

interface Props {
  article: Article;
  targetLang: string;
  mode: 'hover' | 'select' | 'none';
}

export function ArticleRenderer({ article, targetLang, mode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, position, clearSelection } = useTextSelection(containerRef);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Wrap words for hover mode
  const processContent = (html: string): string => {
    if (mode !== 'hover') return html;
    return html.replace(
      /\b([a-zA-Z']+)\b/g,
      '<span class="hover-word cursor-help">$1</span>',
    );
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    if (mode !== 'hover') return;
    const target = e.target as HTMLElement;
    if (target.classList.contains('hover-word')) {
      setHoveredWord(target.textContent);
      setHoverPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="relative">
      <ReadingProgress containerRef={containerRef} />
      
      <div
        ref={containerRef}
        className="prose prose-lg dark:prose-invert max-w-3xl mx-auto
                   font-serif leading-relaxed text-gray-800 dark:text-gray-200
                   selection:bg-blue-200 dark:selection:bg-blue-800"
        onMouseOver={handleMouseOver}
        onMouseLeave={() => setHoveredWord(null)}
        dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
      />

      {/* Selection translation */}
      {mode === 'select' && selection && position && (
        <SelectionTranslation
          text={selection}
          position={position}
          targetLang={targetLang}
          context={getContext(containerRef, position)}
          onClose={clearSelection}
        />
      )}

      {/* Hover translation */}
      {mode === 'hover' && hoveredWord && (
        <HoverTranslation
          word={hoveredWord}
          position={hoverPosition}
          targetLang={targetLang}
        />
      )}
    </div>
  );
}

function getContext(ref: React.RefObject<HTMLDivElement>, position: any): string {
  // Extract surrounding paragraph text for contextual translation
  const selection = window.getSelection();
  if (!selection?.anchorNode) return '';
  const paragraph = selection.anchorNode.parentElement?.closest('p');
  return paragraph?.textContent?.substring(0, 500) || '';
}
```

---

### `components/translation/TranslationCard.tsx`

Displays translation result with all fields from the AI response.

```tsx
'use client';

import { useState } from 'react';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { SaveVocabularyButton } from '@/components/vocabulary/SaveVocabularyButton';
import { Badge } from '@/components/ui/Badge';
import type { TranslationResult } from '@/types/translation.types';

interface Props {
  word: string;
  result: TranslationResult;
  sourceUrl?: string;
  contextSentence?: string;
  onClose?: () => void;
}

export function TranslationCard({ word, result, sourceUrl, contextSentence, onClose }: Props) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-80
                    border border-gray-100 dark:border-gray-800">
      
      {/* Header: word + IPA + part of speech */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{word}</h3>
            <AudioPlayer word={word} lang="en" size="sm" />
          </div>
          {result.ipa && (
            <span className="text-sm text-gray-400 font-mono">{result.ipa}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="secondary">{result.partOfSpeech}</Badge>
          {result.register && result.register !== 'neutral' && (
            <Badge variant="outline">{result.register}</Badge>
          )}
        </div>
      </div>

      {/* Primary translation */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mb-3">
        <p className="text-gray-700 dark:text-gray-200 font-medium">
          {result.translation}
        </p>
        {result.contextMeaning && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            In context: {result.contextMeaning}
          </p>
        )}
      </div>

      {/* Alternative meanings */}
      {result.alternativeMeanings?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Also means
          </p>
          <div className="flex flex-wrap gap-1">
            {result.alternativeMeanings.map((m, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800
                                       text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examples toggle */}
      {result.examples?.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showExamples ? 'Hide' : 'Show'} examples ({result.examples.length})
          </button>
          {showExamples && (
            <div className="mt-2 space-y-2">
              {result.examples.map((ex, i) => (
                <div key={i} className="text-xs border-l-2 border-blue-200 pl-2">
                  <p className="text-gray-700 dark:text-gray-300 italic">{ex.en}</p>
                  <p className="text-gray-500 dark:text-gray-500">{ex[Object.keys(ex).find(k => k !== 'en')!]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collocations */}
      {result.collocations?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Common phrases
          </p>
          <div className="flex flex-wrap gap-1">
            {result.collocations.map((c, i) => (
              <span key={i} className="text-xs text-purple-600 dark:text-purple-400
                                       bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
        <SaveVocabularyButton
          word={word}
          translationResult={result}
          sourceUrl={sourceUrl}
          contextSentence={contextSentence}
        />
      </div>
    </div>
  );
}
```

---

### `components/flashcard/FlashcardItem.tsx`

Flip card with SM-2 rating buttons.

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { RatingButtons } from './RatingButtons';
import type { FlashcardWithVocab } from '@/types/vocabulary.types';

interface Props {
  card: FlashcardWithVocab;
  onRate: (vocabId: string, score: number, durationMs: number) => void;
  totalRemaining: number;
}

export function FlashcardItem({ card, onRate, totalRemaining }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [startTime] = useState(Date.now());

  const handleRate = (score: number) => {
    const durationMs = Date.now() - startTime;
    onRate(card.vocabId, score, durationMs);
    setFlipped(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      
      {/* Progress indicator */}
      <div className="w-full flex items-center justify-between text-sm text-gray-500">
        <span>{totalRemaining} remaining</span>
        <span className="text-xs">Click card to reveal</span>
      </div>

      {/* Card */}
      <div
        className="w-full h-64 cursor-pointer perspective-1000"
        onClick={() => !flipped && setFlipped(true)}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front: word + IPA */}
          <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-900
                          rounded-2xl border-2 border-gray-100 dark:border-gray-800
                          flex flex-col items-center justify-center p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.vocab.word}
              </h2>
              <AudioPlayer word={card.vocab.word} lang={card.vocab.sourceLang} />
            </div>
            {card.vocab.ipa && (
              <p className="text-gray-400 font-mono text-lg">{card.vocab.ipa}</p>
            )}
            <p className="text-sm text-gray-400 mt-4">
              {card.vocab.partOfSpeech}
            </p>
          </div>

          {/* Back: translation + example */}
          <div
            className="absolute inset-0 backface-hidden bg-blue-50 dark:bg-blue-950
                        rounded-2xl border-2 border-blue-100 dark:border-blue-900
                        flex flex-col items-center justify-center p-8 shadow-lg"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100 text-center mb-4">
              {card.vocab.translation}
            </p>
            {card.vocab.examples?.[0] && (
              <div className="text-sm text-center">
                <p className="text-gray-600 dark:text-gray-400 italic mb-1">
                  "{card.vocab.examples[0].en}"
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  {card.vocab.examples[0][card.vocab.targetLang]}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Rating buttons — only shown after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <RatingButtons onRate={handleRate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### `components/pins/PinOverlay.tsx`

Floating sticky note overlay — visible while reading.

```tsx
'use client';

import { useState } from 'react';
import { usePins } from '@/hooks/usePins';
import { PinNote } from './PinNote';
import { cn } from '@/lib/utils';

export function PinOverlay() {
  const { pins, removePin } = usePins();
  const [collapsed, setCollapsed] = useState(false);

  if (pins.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500
                   text-yellow-900 text-xs font-medium px-3 py-1.5 rounded-full
                   shadow-md transition-colors"
      >
        📌 {pins.length} pin{pins.length !== 1 ? 's' : ''}
        <span className="ml-1">{collapsed ? '▲' : '▼'}</span>
      </button>

      {/* Pin notes */}
      {!collapsed && (
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {pins.map((pin, i) => (
            <PinNote
              key={pin.vocabId}
              pin={pin}
              onRemove={() => removePin(pin.vocabId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### `hooks/useTextSelection.ts`

Custom hook for detecting text selections with position.

```ts
import { useEffect, useState, useCallback, RefObject } from 'react';

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

export function useTextSelection(containerRef: RefObject<HTMLElement>) {
  const [selection, setSelection] = useState<string | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return; // Don't clear immediately — let click handle clearing
    }

    const text = sel.toString().trim();
    if (text.length < 1 || text.length > 500) return;

    // Check if selection is within our container
    const range = sel.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    setSelection(text);
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  }, [containerRef]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setPosition(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('touchend', handleSelectionChange);
    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('touchend', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return { selection, position, clearSelection };
}
```

---

### `stores/language.store.ts`

Zustand store for language preferences.

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  sourceLang: string;
  targetLang: string;
  translationMode: 'hover' | 'select' | 'none';
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  setTranslationMode: (mode: 'hover' | 'select' | 'none') => void;
  swapLanguages: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      sourceLang: 'en',
      targetLang: 'vi',
      translationMode: 'select',
      setSourceLang: (lang) => set({ sourceLang: lang }),
      setTargetLang: (lang) => set({ targetLang: lang }),
      setTranslationMode: (mode) => set({ translationMode: mode }),
      swapLanguages: () =>
        set({ sourceLang: get().targetLang, targetLang: get().sourceLang }),
    }),
    {
      name: 'lingoreader-language',
      partialize: (state) => ({
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        translationMode: state.translationMode,
      }),
    },
  ),
);
```

---

### `stores/vocabulary.store.ts`

Zustand store for vocabulary with optimistic updates.

```ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VocabularyItem } from '@/types/vocabulary.types';

interface VocabularyState {
  items: VocabularyItem[];
  pins: string[];                    // vocabId list
  pendingSave: VocabularyItem | null;
  setItems: (items: VocabularyItem[]) => void;
  addItem: (item: VocabularyItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<VocabularyItem>) => void;
  setPendingSave: (item: VocabularyItem | null) => void;
  togglePin: (vocabId: string) => void;
}

export const useVocabularyStore = create<VocabularyState>()(
  immer((set) => ({
    items: [],
    pins: [],
    pendingSave: null,
    setItems: (items) => set((state) => { state.items = items; }),
    addItem: (item) => set((state) => { state.items.unshift(item); }),
    removeItem: (id) =>
      set((state) => { state.items = state.items.filter((i) => i.id !== id); }),
    updateItem: (id, patch) =>
      set((state) => {
        const idx = state.items.findIndex((i) => i.id === id);
        if (idx !== -1) Object.assign(state.items[idx], patch);
      }),
    setPendingSave: (item) => set((state) => { state.pendingSave = item; }),
    togglePin: (vocabId) =>
      set((state) => {
        const idx = state.pins.indexOf(vocabId);
        if (idx === -1) state.pins.push(vocabId);
        else state.pins.splice(idx, 1);
      }),
  })),
);
```

---

### `lib/api.ts`

Centralized API client with auth token injection and refresh.

```ts
import axios, { AxiosInstance } from 'axios';
import { getAccessToken, refreshTokens, clearTokens } from './auth';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  withCredentials: true,
  timeout: 15000,
});

// Inject access token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { accessToken } = await refreshTokens();
        refreshQueue.forEach((cb) => cb(accessToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        clearTokens();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// Typed API functions
export const readerApi = {
  fetch: (url: string) => api.post('/reader/fetch', { url }),
  summarize: (articleId: string, targetLang: string, level: string) =>
    api.post('/reader/summarize', { articleId, targetLang, level }),
};

export const translationApi = {
  contextual: (dto: any) => api.post('/translation/contextual', dto),
  fullPage: (articleId: string, targetLang: string) =>
    api.post('/translation/full-page', { articleId, targetLang }),
};

export const vocabularyApi = {
  list: (params: any) => api.get('/vocabulary', { params }),
  create: (data: any) => api.post('/vocabulary', data),
  update: (id: string, data: any) => api.patch(`/vocabulary/${id}`, data),
  delete: (id: string) => api.delete(`/vocabulary/${id}`),
  pin: (id: string) => api.post(`/vocabulary/${id}/pin`),
  unpin: (id: string) => api.delete(`/vocabulary/${id}/pin`),
  getPins: () => api.get('/vocabulary/pins'),
};

export const flashcardApi = {
  getDueToday: () => api.get('/flashcards/due-today'),
  review: (id: string, score: number, durationMs: number) =>
    api.post(`/flashcards/${id}/review`, { score, durationMs }),
  getStats: () => api.get('/flashcards/stats'),
};

export const ttsApi = {
  generate: (text: string, lang: string) => api.post('/tts/generate', { text, lang }),
};
```

---

## Page Implementations

---

### `app/(public)/reader/page.tsx`

```tsx
import { Metadata } from 'next';
import { ReaderPageClient } from './ReaderPageClient';

export const metadata: Metadata = {
  title: 'Read & Learn | LingoReader',
  description: 'Paste any article URL and start learning vocabulary in context',
  openGraph: {
    title: 'LingoReader — Read & Learn',
    description: 'Learn languages by reading real content',
    type: 'website',
  },
};

export default function ReaderPage() {
  return <ReaderPageClient />;
}
```

---

### `app/(dashboard)/layout.tsx`

Dashboard shell with sidebar, pin overlay, and auth guard.

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { PinOverlay } from '@/components/pins/PinOverlay';
import { TopNav } from '@/components/layout/TopNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <PinOverlay />
    </div>
  );
}
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "zustand": "4.x",
    "immer": "10.x",
    "@tanstack/react-query": "5.x",
    "axios": "1.x",
    "framer-motion": "11.x",
    "next-seo": "6.x",
    "next-themes": "0.x",
    "@radix-ui/react-popover": "1.x",
    "@radix-ui/react-tooltip": "1.x",
    "@radix-ui/react-dialog": "1.x",
    "@radix-ui/react-dropdown-menu": "1.x",
    "class-variance-authority": "0.x",
    "clsx": "2.x",
    "tailwind-merge": "2.x",
    "date-fns": "3.x",
    "react-hot-toast": "2.x",
    "dompurify": "3.x",
    "@dnd-kit/core": "6.x",
    "@dnd-kit/sortable": "8.x"
  },
  "devDependencies": {
    "@types/react": "18.x",
    "@types/node": "20.x",
    "@types/dompurify": "3.x",
    "eslint": "8.x",
    "eslint-config-next": "14.x",
    "prettier": "3.x",
    "vitest": "1.x",
    "@testing-library/react": "14.x"
  }
}
```

---

## SEO Configuration (`next.config.js`)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['*'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', '@radix-ui/react-popover'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

*LingoReader Frontend Architecture — Next.js 14 App Router*
