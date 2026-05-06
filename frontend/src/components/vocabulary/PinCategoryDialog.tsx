import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { vocabularyApi } from '@/lib/api';
import { Plus, Check, Edit2, X } from 'lucide-react';
import { CATEGORY_BG_COLORS, getCategoryBgClass } from '@/lib/colors';
import { cn } from '@/lib/utils';

interface PinCategoryDialogProps {
  vocabId: string;
  isOpen: boolean;
  onClose: () => void;
  onPinSuccess?: () => void;
}

export function PinCategoryDialog({ vocabId, isOpen, onClose, onPinSuccess }: PinCategoryDialogProps) {
  const qc = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('amber');
  const [isCreating, setIsCreating] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryColor, setEditCategoryColor] = useState('amber');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['pin-categories'],
    queryFn: () => vocabularyApi.getCategories().then((res) => res.data.data),
    enabled: isOpen,
  });

  const pinMutation = useMutation({
    mutationFn: (categoryId?: string) => vocabularyApi.pin(vocabId, categoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pinned-vocabulary'] });
      if (onPinSuccess) onPinSuccess();
      onClose();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string, color: string }) => vocabularyApi.createCategory(data.name, data.color),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pin-categories'] });
      setNewCategoryName('');
      setNewCategoryColor('amber');
      setIsCreating(false);
      // Automatically pin to the newly created category
      pinMutation.mutate(res.data.data.id);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { id: string, name?: string, color?: string }) => vocabularyApi.updateCategory(data.id, data.name, data.color),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pin-categories'] });
      setEditingCategoryId(null);
    },
  });

  const handleCreate = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({ name: newCategoryName.trim(), color: newCategoryColor });
  };

  const handleUpdate = () => {
    if (!editCategoryName.trim() || !editingCategoryId) return;
    updateCategoryMutation.mutate({ id: editingCategoryId, name: editCategoryName.trim(), color: editCategoryColor });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pin Vocabulary</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">Select a category to pin this word, or create a new one.</p>
          
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Loading categories...</div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <Button
                variant="outline"
                className="justify-start font-normal h-12"
                onClick={() => pinMutation.mutate(undefined)}
                disabled={pinMutation.isPending}
              >
                <span className="w-4 h-4 rounded-full bg-amber-500 mr-3 shrink-0" />
                Uncategorized (Default)
              </Button>
              
              {categories.map((cat: any) => (
                <div key={cat.id} className="group flex items-center relative">
                  {editingCategoryId === cat.id ? (
                    <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded-md w-full animate-fade-in border">
                      <div className="flex items-center gap-2">
                        <Input
                          autoFocus
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                          className="h-8"
                        />
                        <Button size="sm" onClick={handleUpdate} disabled={updateCategoryMutation.isPending || !editCategoryName.trim()} className="h-8 w-8 p-0">
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(CATEGORY_BG_COLORS).map(([colorName, bgClass]) => (
                          <button
                            key={colorName}
                            onClick={() => setEditCategoryColor(colorName)}
                            className={cn(
                              "w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-110",
                              bgClass,
                              editCategoryColor === colorName ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                            )}
                            title={colorName}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="justify-start font-normal h-12 w-full pr-10"
                        onClick={() => pinMutation.mutate(cat.id)}
                        disabled={pinMutation.isPending}
                      >
                        <span className={cn("w-4 h-4 rounded-full mr-3 shrink-0", getCategoryBgClass(cat.color))} />
                        <span className="truncate">{cat.name}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategoryId(cat.id);
                          setEditCategoryName(cat.name);
                          setEditCategoryColor(cat.color || 'amber');
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 mt-2">
            {isCreating ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Input
                    autoFocus
                    placeholder="Category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                  <Button size="icon" onClick={handleCreate} disabled={createCategoryMutation.isPending || !newCategoryName.trim()}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(CATEGORY_BG_COLORS).map(([colorName, bgClass]) => (
                    <button
                      key={colorName}
                      onClick={() => setNewCategoryColor(colorName)}
                      className={cn(
                        "w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 flex items-center justify-center",
                        bgClass,
                        newCategoryColor === colorName ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""
                      )}
                      title={colorName}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create new category
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
