// =============================================================
// LingoReader — Vocabulary Types
// =============================================================

import type { TranslationExample } from './translation.types';

export type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered';

export interface VocabularyItem {
  id: string;
  userId: string;
  word: string;
  translation: string;
  ipa?: string;
  contextSentence?: string;
  contextUrl?: string;
  contextTitle?: string;
  partOfSpeech?: string;
  examples: TranslationExample[];
  collocations: string[];
  tags: string[];
  sourceLang: string;
  targetLang: string;
  isPinned: boolean;
  isMastered: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5;
  reviewCount: number;
  lastReviewedAt?: string;
  notes?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVocabularyDto {
  word: string;
  translation: string;
  ipa?: string;
  contextSentence?: string;
  contextUrl?: string;
  contextTitle?: string;
  partOfSpeech?: string;
  examples?: TranslationExample[];
  collocations?: string[];
  tags?: string[];
  sourceLang: string;
  targetLang: string;
}

export interface VocabularyFilters {
  search?: string;
  tags?: string[];
  sourceLang?: string;
  targetLang?: string;
  isMastered?: boolean;
  isPinned?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'reviewCount' | 'difficulty' | 'word';
  sortOrder?: 'asc' | 'desc';
}

// ── Flashcards ─────────────────────────────────────────────────

export interface FlashcardSession {
  id: string;
  userId: string;
  vocabId: string;
  score: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  reviewHistory: ReviewHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardWithVocab extends FlashcardSession {
  vocab: VocabularyItem;
}

export interface ReviewHistoryEntry {
  date: string;
  score: number;
  durationMs: number;
}

export interface FlashcardStats {
  totalDue: number;
  totalReviewed: number;
  correctToday: number;
  incorrectToday: number;
  streak: number;
  masteredCount: number;
}

// ── Pinned Vocabulary ──────────────────────────────────────────

export interface PinnedVocab {
  vocabId: string;
  displayOrder: number;
  color: PinColor;
  vocab: VocabularyItem;
}

export type PinColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
