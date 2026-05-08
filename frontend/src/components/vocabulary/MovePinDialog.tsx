"use client";
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { vocabularyApi } from '@/lib/api';
import { getCategoryBgClass } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { ArrowRight, Check } from 'lucide-react';

interface MovePinDialogProps {
  vocabId: string | null;
  vocabWord: string;
  currentCategoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovePinDialog({ vocabId, vocabWord, currentCategoryId, isOpen, onClose }: MovePinDialogProps) {
  const qc = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['pin-categories'],
    queryFn: () => vocabularyApi.getCategories().then((res) => res.data.data),
    enabled: isOpen,
  });

  const moveMutation = useMutation({
    mutationFn: (categoryId: string | null) => vocabularyApi.movePin(vocabId!, categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-vocabulary'] });
      onClose();
    },
  });

  if (!vocabId) return null;

  // All destinations including "Uncategorized" — filter out the current one
  const destinations = [
    { id: null, name: 'Uncategorized (Default)', color: 'amber' },
    ...categories,
  ].filter((cat) => cat.id !== currentCategoryId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            Move to Category
          </DialogTitle>
          <DialogDescription>
            Move <span className="font-semibold text-foreground">"{vocabWord}"</span> to a different category.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-6">Loading categories...</div>
          ) : destinations.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              No other categories available.
            </div>
          ) : (
            destinations.map((cat) => (
              <Button
                key={cat.id ?? 'uncategorized'}
                variant="outline"
                className="justify-start font-normal h-12 w-full"
                onClick={() => moveMutation.mutate(cat.id)}
                disabled={moveMutation.isPending}
              >
                {moveMutation.isPending ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-3 shrink-0" />
                ) : (
                  <span className={cn('w-4 h-4 rounded-full mr-3 shrink-0', getCategoryBgClass(cat.color))} />
                )}
                <span className="truncate">{cat.name}</span>
                {currentCategoryId === cat.id && <Check className="h-4 w-4 ml-auto text-muted-foreground" />}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
