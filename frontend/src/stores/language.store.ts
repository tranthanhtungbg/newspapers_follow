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
