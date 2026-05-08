import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type LineHeight = 'snug' | 'normal' | 'relaxed' | 'loose';
export type ReadingWidth = 'narrow' | 'normal' | 'wide';

interface UiState {
  // Reader appearance
  fontSize: FontSize;
  fontFamily: FontFamily;
  lineHeight: LineHeight;
  readingWidth: ReadingWidth;

  // Panel states
  isSummaryOpen: boolean;
  isPinOverlayCollapsed: boolean;

  // Flashcard TTS Settings
  flashcardVoice: string;
  flashcardRate: number;

  // Setters
  setFontSize: (size: FontSize) => void;
  setFontFamily: (font: FontFamily) => void;
  setLineHeight: (height: LineHeight) => void;
  setReadingWidth: (width: ReadingWidth) => void;
  toggleSummary: () => void;
  togglePinOverlay: () => void;
  setFlashcardVoice: (voice: string) => void;
  setFlashcardRate: (rate: number) => void;
  resetAppearance: () => void;
}

// ─────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────

const DEFAULTS = {
  fontSize: 'base' as FontSize,
  fontFamily: 'serif' as FontFamily,
  lineHeight: 'relaxed' as LineHeight,
  readingWidth: 'normal' as ReadingWidth,
  flashcardVoice: '',
  flashcardRate: 0.9,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      isSummaryOpen: false,
      isPinOverlayCollapsed: false,

      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setLineHeight: (height) => set({ lineHeight: height }),
      setReadingWidth: (width) => set({ readingWidth: width }),
      toggleSummary: () => set((s) => ({ isSummaryOpen: !s.isSummaryOpen })),
      togglePinOverlay: () =>
        set((s) => ({ isPinOverlayCollapsed: !s.isPinOverlayCollapsed })),
      setFlashcardVoice: (voice) => set({ flashcardVoice: voice }),
      setFlashcardRate: (rate) => set({ flashcardRate: rate }),
      resetAppearance: () => set(DEFAULTS),
    }),
    {
      name: 'lingoreader-ui-settings',
      partialize: (state) => ({
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineHeight: state.lineHeight,
        readingWidth: state.readingWidth,
        flashcardVoice: state.flashcardVoice,
        flashcardRate: state.flashcardRate,
      }),
    },
  ),
);

// ─────────────────────────────────────────────
// CSS class maps (TailwindCSS)
// ─────────────────────────────────────────────

export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

export const FONT_FAMILY_CLASS: Record<FontFamily, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

export const LINE_HEIGHT_CLASS: Record<LineHeight, string> = {
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
};

export const READING_WIDTH_CLASS: Record<ReadingWidth, string> = {
  narrow: 'max-w-xl',
  normal: 'max-w-3xl',
  wide: 'max-w-5xl',
};
