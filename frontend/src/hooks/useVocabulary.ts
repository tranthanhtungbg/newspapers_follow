import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vocabularyApi } from '@/lib/api';
import { useVocabularyStore } from '@/stores/vocabulary.store';
import type { VocabularyItem, VocabularyFilters, CreateVocabularyDto } from '@/types/vocabulary.types';

const VOCAB_KEY = ['vocabulary'];

export function useVocabulary(filters?: VocabularyFilters) {
  const qc = useQueryClient();
  const { addItem, removeItem, updateItem } = useVocabularyStore();

  // ── List ────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: [...VOCAB_KEY, filters],
    queryFn: () =>
      vocabularyApi.list(filters as unknown as Record<string, unknown>).then((r) => r.data),
  });

  // ── Save ────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (dto: CreateVocabularyDto) =>
      vocabularyApi.create(dto as unknown as Record<string, unknown>).then((r) => r.data.data as VocabularyItem),
    onSuccess: (item) => {
      addItem(item);
      qc.invalidateQueries({ queryKey: VOCAB_KEY });
    },
  });

  // ── Delete ──────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vocabularyApi.delete(id),
    onMutate: (id) => removeItem(id),   // optimistic
    onError: () => qc.invalidateQueries({ queryKey: VOCAB_KEY }),
  });

  // ── Update ──────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VocabularyItem> }) =>
      vocabularyApi.update(id, data as unknown as Record<string, unknown>).then((r) => r.data.data as VocabularyItem),
    onMutate: ({ id, data }) => updateItem(id, data),   // optimistic
    onError: () => qc.invalidateQueries({ queryKey: VOCAB_KEY }),
  });

  // ── Pin ─────────────────────────────────────────────────────
  const pinMutation = useMutation({
    mutationFn: (id: string) => vocabularyApi.pin(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pinned-vocabulary'] }),
  });

  const unpinMutation = useMutation({
    mutationFn: (id: string) => vocabularyApi.unpin(id).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pinned-vocabulary'] }),
  });

  return {
    items: query.data?.data as VocabularyItem[] ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    saveVocab: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteVocab: deleteMutation.mutate,
    updateVocab: updateMutation.mutate,
    pinVocab: pinMutation.mutateAsync,
    unpinVocab: unpinMutation.mutateAsync,
    isPinning: pinMutation.isPending,
  };
}
