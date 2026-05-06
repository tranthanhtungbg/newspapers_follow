'use client';

import { useState } from 'react';
import { Search, Download, CheckCircle2, BookMarked } from 'lucide-react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { VocabularyCard } from '@/components/vocabulary/VocabularyCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { VocabularyFilters } from '@/types/vocabulary.types';

const SORT_OPTIONS = [
  { key: 'createdAt', label: 'Newest' },
  { key: 'reviewCount', label: 'Most Reviewed' },
  { key: 'difficulty', label: 'Hardest' },
] as const;

export default function VocabularyPage() {
  const [filters, setFilters] = useState<VocabularyFilters>({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [search, setSearch] = useState('');
  const { items, isLoading, meta } = useVocabulary(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            My Vocabulary
          </h1>
          {meta && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.total} {meta.total === 1 ? 'word' : 'words'} saved
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search words, translations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>

      {/* Sort + Filter controls */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilters((f) => ({ ...f, sortBy: key }))}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
              filters.sortBy === key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent',
            )}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setFilters((f) => ({ ...f, isMastered: f.isMastered === true ? undefined : true }))}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5',
            filters.isMastered
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-accent',
          )}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Mastered only
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <BookMarked className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-base font-semibold text-foreground mb-1">No vocabulary yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Start reading articles and save words you want to learn.
          </p>
          <Button className="mt-4 gap-2" asChild>
            <a href="/reader">Open Reader</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <VocabularyCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
