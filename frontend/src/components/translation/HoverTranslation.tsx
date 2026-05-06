'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationResult } from '@/types/translation.types';

interface Props {
  word: string;
  position: { x: number; y: number };
  targetLang: string;
}

export function HoverTranslation({ word, position, targetLang }: Props) {
  const { translate, isLoading } = useTranslation();
  const [result, setResult] = useState<TranslationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const res = await translate(word, '', undefined);
      if (!cancelled) setResult(res ?? null);
    }, 400); // 400ms debounce to avoid API spam

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [word]);  // eslint-disable-line react-hooks/exhaustive-deps

  const style: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y - 8,
    transform: 'translate(-50%, -100%)',
    zIndex: 100,
    maxWidth: 260,
  };

  if (!isLoading && !result) return null;

  return (
    <div
      style={style}
      className="bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-xl
                 px-3 py-2 text-xs pointer-events-none animate-fade-in
                 border border-gray-700"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-300">…</span>
        </div>
      ) : result ? (
        <>
          <span className="font-semibold text-blue-300">{result.translation}</span>
          {result.ipa && (
            <span className="text-gray-400 ml-1.5 font-mono text-xs">{result.ipa}</span>
          )}
          <div className="text-gray-400 text-xs mt-0.5">{result.partOfSpeech}</div>
        </>
      ) : null}
      {/* Arrow */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full
                      border-4 border-transparent border-t-gray-900 dark:border-t-gray-800" />
    </div>
  );
}
