import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '@/lib/api';
import type { LibraryListResponse, SavedResource } from '@/types/library.types';

export function useLibrary(params: Record<string, unknown> = {}) {
  const queryClient = useQueryClient();

  const query = useQuery<LibraryListResponse>({
    queryKey: ['library', params],
    queryFn: () => libraryApi.list(params).then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => libraryApi.delete(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavedResource> }) =>
      libraryApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  return {
    ...query,
    deleteResource: deleteMutation.mutateAsync,
    updateResource: updateMutation.mutateAsync,
  };
}
