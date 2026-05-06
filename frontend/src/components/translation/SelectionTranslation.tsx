'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useVocabulary } from '@/hooks/useVocabulary';
import { TranslationCard } from './TranslationCard';
import { cn } from '@/lib/utils';
import type { TranslationResult } from '@/types/translation.types';

interface Props {
  text: string;
  position: { x: number; y: number };
  targetLang: string;
  context: string;
  onClose: () => void;
  articleId?: string;
  sourceUrl?: string;
  rects?: { top: number; left: number; width: number; height: number }[];
}

export function SelectionTranslation({ text, position, targetLang, context, onClose, articleId, sourceUrl, rects }: Props) {
  const { translate } = useTranslation();
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(true);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await translate(text, context, articleId);
      setResult(res ?? null);
    } catch (error) {
      console.error(error);
      setResult(null);
    } finally {
      setIsTranslating(false);
    }
  };

  const lastTranslatedText = useRef('');

  // Auto-trigger on mount or when text changes (prevent StrictMode duplicates)
  useEffect(() => {
    if (lastTranslatedText.current !== text) {
      lastTranslatedText.current = text;
      handleTranslate();
    }
  }, [text, context]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: Math.max(16, Math.min(position.x - 160, window.innerWidth - 336)),
    top: position.y - 10,
    transform: 'translateY(-100%)',
    zIndex: 9999,
  };

  // Calculate arrow horizontal position relative to the popover
  const popoverLeft = Math.max(16, Math.min(position.x - 160, window.innerWidth - 336));
  const arrowLeft = Math.max(20, Math.min(300, position.x - popoverLeft));

  const content = (
    <>
      {/* Custom visual highlights for the selected text */}
      {rects?.map((r, i) => (
        <div
          key={i}
          className="absolute bg-blue-500/30 pointer-events-none mix-blend-multiply dark:mix-blend-lighten z-[9998] rounded-sm"
          style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
        />
      ))}
      
      {/* The Popover */}
      <div style={style} className="animate-scale-in flex flex-col">
        {isTranslating ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-5 w-72 border border-gray-100 dark:border-gray-800 relative">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Translating "{text.slice(0, 20)}{text.length > 20 ? '…' : ''}"</span>
            </div>
          </div>
        ) : result ? (
          <div className="relative">
            <TranslationCard
              word={text}
              result={result}
              sourceUrl={sourceUrl}
              contextSentence={context}
              onClose={onClose}
            />
          </div>
        ) : null}

        {/* The downward pointing arrow */}
        <div 
          className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-900 drop-shadow-md absolute"
          style={{ bottom: -8, left: arrowLeft - 8 }}
        />
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
