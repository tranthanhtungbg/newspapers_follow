import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { readerApi, libraryApi } from '@/lib/api';
import { useReaderStore } from '@/stores/reader.store';
import type { Article } from '@/types/reader.types';

export function useReader() {
  const {
    article, isLoading, error, url,
    setArticle, setLoading, setError, setUrl, reset,
  } = useReaderStore();

  const fetchMutation = useMutation({
    mutationFn: (inputUrl: string) => readerApi.fetch(inputUrl),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (res, inputUrl) => {
      const data = res.data.data as Article;
      setArticle(data);
      // Auto-save to Library
      libraryApi.create({
        url: inputUrl,
        title: data.title || 'Web Article',
        type: 'article',
      }).catch(() => {});
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to fetch article. Please check the URL.';
      setError(message);
    },
    onSettled: () => setLoading(false),
  });

  const fetchArticle = useCallback(
    (inputUrl: string) => {
      const trimmed = inputUrl.trim();
      if (!trimmed) return;
      setUrl(trimmed);
      fetchMutation.mutate(trimmed);
    },
    [fetchMutation.mutate, setUrl],
  );

  return {
    article,
    isLoading,
    error,
    url,
    fetchArticle,
    reset,
  };
}
