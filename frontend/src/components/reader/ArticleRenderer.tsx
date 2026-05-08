'use client';

import { useEffect, useRef, useState } from 'react';
import { useTextSelection } from '@/hooks/useTextSelection';
import { SelectionTranslation } from '@/components/translation/SelectionTranslation';
import { HoverTranslation } from '@/components/translation/HoverTranslation';
import { ReadingProgress } from './ReadingProgress';
import {
  useUiStore,
  FONT_SIZE_CLASS,
  FONT_FAMILY_CLASS,
  LINE_HEIGHT_CLASS,
  READING_WIDTH_CLASS,
} from '@/stores/ui.store';
import type { Article } from '@/types/reader.types';

interface Props {
  article: Article;
  targetLang: string;
  mode: 'hover' | 'select' | 'none';
}

export function ArticleRenderer({ article, targetLang, mode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, position, clearSelection } = useTextSelection(containerRef);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Appearance settings from store
  const { fontSize, fontFamily, lineHeight, readingWidth } = useUiStore();

  // Wrap words for hover mode
  const processContent = (html: string): string => {
    if (mode !== 'hover') return html;
    return html.replace(
      /\b([a-zA-Z']+)\b/g,
      '<span class="hover-word cursor-help underline-offset-2 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">$1</span>',
    );
  };

  const handleMouseOver = (e: React.MouseEvent) => {
    if (mode !== 'hover') return;
    const target = e.target as HTMLElement;
    if (target.classList.contains('hover-word')) {
      setHoveredWord(target.textContent);
      setHoverPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="relative flex justify-center px-4 py-8">
      <ReadingProgress containerRef={containerRef} />

      <div
        id="reader-content"
        ref={containerRef}
        className={`
          prose dark:prose-invert w-full mx-auto
          text-gray-800 dark:text-gray-200
          selection:bg-blue-200 dark:selection:bg-blue-800
          transition-all duration-300
          ${FONT_SIZE_CLASS[fontSize]}
          ${FONT_FAMILY_CLASS[fontFamily]}
          ${LINE_HEIGHT_CLASS[lineHeight]}
          ${READING_WIDTH_CLASS[readingWidth]}
        `}
        onMouseOver={handleMouseOver}
        onMouseLeave={() => setHoveredWord(null)}
        dangerouslySetInnerHTML={{ __html: processContent(article.content) }}
      />

      {/* Selection translation popover */}
      {mode === 'select' && selection && position && (
        <SelectionTranslation
          text={selection.text}
          position={position}
          targetLang={targetLang}
          context={getContext(containerRef)}
          onClose={clearSelection}
          rects={selection.rects}
        />
      )}

      {/* Hover translation tooltip */}
      {mode === 'hover' && hoveredWord && (
        <HoverTranslation
          word={hoveredWord}
          position={hoverPosition}
          targetLang={targetLang}
        />
      )}
    </div>
  );
}

function getContext(ref: React.RefObject<HTMLDivElement>): string {
  const selection = window.getSelection();
  if (!selection?.anchorNode) return '';
  const paragraph = selection.anchorNode.parentElement?.closest('p');
  return paragraph?.textContent?.substring(0, 500) || '';
}
