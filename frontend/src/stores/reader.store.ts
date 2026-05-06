import { create } from 'zustand';
import type { Article, TranslationMode, ArticleSummary, SummaryLevel } from '@/types/reader.types';

interface ReaderState {
  article: Article | null;
  isLoading: boolean;
  error: string | null;
  url: string;

  summary: ArticleSummary | null;
  summaryLevel: SummaryLevel;
  isSummaryLoading: boolean;

  isFullPageTranslated: boolean;
  translatedContent: string | null;

  setArticle: (article: Article | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUrl: (url: string) => void;
  setSummary: (summary: ArticleSummary | null) => void;
  setSummaryLevel: (level: SummaryLevel) => void;
  setSummaryLoading: (loading: boolean) => void;
  setFullPageTranslated: (val: boolean, content?: string) => void;
  reset: () => void;
}

const initialState = {
  article: null,
  isLoading: false,
  error: null,
  url: '',
  summary: null,
  summaryLevel: 'brief' as SummaryLevel,
  isSummaryLoading: false,
  isFullPageTranslated: false,
  translatedContent: null,
};

export const useReaderStore = create<ReaderState>()((set) => ({
  ...initialState,

  setArticle: (article) => set({ article, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setUrl: (url) => set({ url }),
  setSummary: (summary) => set({ summary }),
  setSummaryLevel: (summaryLevel) => set({ summaryLevel }),
  setSummaryLoading: (isSummaryLoading) => set({ isSummaryLoading }),
  setFullPageTranslated: (val, content) =>
    set({ isFullPageTranslated: val, translatedContent: content ?? null }),
  reset: () => set(initialState),
}));
