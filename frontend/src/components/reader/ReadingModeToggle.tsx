'use client';

import { useLanguageStore } from '@/stores/language.store';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { TranslationMode } from '@/types/reader.types';

const MODES: { value: TranslationMode; label: string; description: string }[] = [
  { value: 'none',   label: 'Off',    description: 'No translation' },
  { value: 'select', label: 'Select', description: 'Click/highlight words' },
  { value: 'hover',  label: 'Hover',  description: 'Hover over words' },
];

interface Props {
  mode: TranslationMode;
  onModeChange: (mode: TranslationMode) => void;
}

export function ReadingModeToggle({ mode, onModeChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Translation mode"
      className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800
                 border border-gray-200 dark:border-gray-700"
    >
      {MODES.map((m) => (
        <button
          key={m.value}
          id={`mode-${m.value}`}
          aria-label={m.description}
          aria-pressed={mode === m.value}
          onClick={() => onModeChange(m.value)}
          title={m.description}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
            mode === m.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
