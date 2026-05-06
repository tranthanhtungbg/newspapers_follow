import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { VocabularyItem } from '@/types/vocabulary.types';

interface VocabularyState {
  items: VocabularyItem[];
  pins: string[];                     // vocabId list
  pendingSave: Partial<VocabularyItem> | null;
  setItems: (items: VocabularyItem[]) => void;
  addItem: (item: VocabularyItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, patch: Partial<VocabularyItem>) => void;
  setPendingSave: (item: Partial<VocabularyItem> | null) => void;
  togglePin: (vocabId: string) => void;
  setPins: (pins: string[]) => void;
}

export const useVocabularyStore = create<VocabularyState>()(
  immer((set) => ({
    items: [],
    pins: [],
    pendingSave: null,

    setItems: (items) => set((state) => { state.items = items; }),

    addItem: (item) => set((state) => { state.items.unshift(item); }),

    removeItem: (id) =>
      set((state) => {
        state.items = state.items.filter((i) => i.id !== id);
        state.pins = state.pins.filter((p) => p !== id);
      }),

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

    setPins: (pins) => set((state) => { state.pins = pins; }),
  })),
);
