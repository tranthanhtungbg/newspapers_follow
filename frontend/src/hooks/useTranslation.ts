import { useMutation } from '@tanstack/react-query';
import { translationApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language.store';
import type { TranslationResult, ContextualTranslationRequest } from '@/types/translation.types';

export function useTranslation() {
  const { sourceLang, targetLang } = useLanguageStore();

  const translateMutation = useMutation({
    mutationFn: (dto: ContextualTranslationRequest) =>
      translationApi.contextual(dto).then((r) => r.data.data as TranslationResult),
  });

  const translate = (text: string, contextParagraph: string, articleId?: string) =>
    translateMutation.mutateAsync({
      text,
      sourceLang,
      targetLang,
      contextParagraph,
      articleId,
    });

  return {
    translate,
    isLoading: translateMutation.isPending,
    error: translateMutation.error,
    data: translateMutation.data,
    reset: translateMutation.reset,
  };
}
