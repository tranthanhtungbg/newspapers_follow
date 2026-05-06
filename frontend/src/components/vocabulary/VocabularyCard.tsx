'use client';

import { useState } from 'react';
import { useVocabulary } from '@/hooks/useVocabulary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, getDifficultyLabel, cn } from '@/lib/utils';
import type { VocabularyItem } from '@/types/vocabulary.types';

interface Props {
  item: VocabularyItem;
  onDelete?: (id: string) => void;
}

const difficultyColors: Record<number, string> = {
  1: 'success', 2: 'success', 3: 'warning', 4: 'danger', 5: 'danger',
};

export function VocabularyCard({ item, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { updateVocab, deleteVocab } = useVocabulary();

  const toggleMastered = () =>
    updateVocab({ id: item.id, data: { isMastered: !item.isMastered } });

  const handleDelete = () => {
    deleteVocab(item.id);
    onDelete?.(item.id);
  };

  return (
    <div className={cn(
      'group rounded-xl border bg-white dark:bg-gray-900 p-4 transition-all duration-200',
      'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
      item.isMastered
        ? 'border-green-200 dark:border-green-900/50'
        : 'border-gray-200 dark:border-gray-800',
    )}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{item.word}</h3>
            {item.ipa && (
              <span className="text-xs text-gray-400 font-mono">{item.ipa}</span>
            )}
            {item.partOfSpeech && (
              <Badge variant="secondary">{item.partOfSpeech}</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 font-medium">
            {item.translation}
          </p>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={toggleMastered}
            title={item.isMastered ? 'Mark as learning' : 'Mark as mastered'}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              item.isMastered
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill={item.isMastered ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Context sentence */}
      {item.contextSentence && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic line-clamp-2">
          "{item.contextSentence}"
        </p>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="blue">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Difficulty: <span className={cn(
            'font-medium',
            item.difficulty >= 4 ? 'text-red-500' : item.difficulty >= 3 ? 'text-yellow-500' : 'text-green-500'
          )}>{getDifficultyLabel(item.difficulty)}</span></span>
          <span>Reviews: {item.reviewCount}</span>
        </div>
        <span className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</span>
      </div>

      {/* Expanded details */}
      {item.examples?.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-blue-500 hover:underline"
        >
          {expanded ? '▲ Less' : '▼ Examples'}
        </button>
      )}
      {expanded && item.examples?.map((ex, i) => (
        <div key={i} className="mt-2 pl-2 border-l-2 border-blue-200 dark:border-blue-800 text-xs">
          <p className="text-gray-700 dark:text-gray-300 italic">{ex.en}</p>
        </div>
      ))}
    </div>
  );
}
