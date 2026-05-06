import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardApi } from '@/lib/api';
import type { FlashcardWithVocab, FlashcardStats } from '@/types/vocabulary.types';

const FLASHCARD_KEYS = {
  dueToday: ['flashcards', 'due-today'],
  stats: ['flashcards', 'stats'],
};

export function useFlashcards(cramMode = false, date?: string) {
  const qc = useQueryClient();

  const dueTodayQuery = useQuery({
    queryKey: [...FLASHCARD_KEYS.dueToday, cramMode, date],
    queryFn: () =>
      flashcardApi.getDueToday(cramMode, date).then((r) => r.data.data as FlashcardWithVocab[]),
  });

  const statsQuery = useQuery({
    queryKey: FLASHCARD_KEYS.stats,
    queryFn: () =>
      flashcardApi.getStats().then((r) => r.data.data as FlashcardStats),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      score,
      durationMs,
    }: {
      id: string;
      score: number;
      durationMs: number;
    }) => flashcardApi.review(id, score, durationMs),
    onSuccess: () => {
      // Only invalidate stats so the session cards remain in memory
      // until the user manually restarts or navigates away.
      qc.invalidateQueries({ queryKey: FLASHCARD_KEYS.stats });
    },
  });

  return {
    cards: dueTodayQuery.data ?? [],
    stats: statsQuery.data,
    isLoading: dueTodayQuery.isLoading,
    isReviewing: reviewMutation.isPending,
    submitReview: reviewMutation.mutateAsync,
  };
}
