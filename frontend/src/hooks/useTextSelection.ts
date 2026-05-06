import { useState, useEffect, useRef, RefObject } from 'react';

export interface TextSelection {
  text: string;
  range: Range | null;
  rects?: { top: number; left: number; width: number; height: number }[];
}

export interface SelectionPosition {
  x: number;
  y: number;
}

export function useTextSelection(containerRef: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const [position, setPosition] = useState<SelectionPosition | null>(null);

  const clearSelection = () => {
    setSelection(null);
    setPosition(null);
    window.getSelection()?.removeAllRanges();
    if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
      CSS.highlights.clear();
    }
  };

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Small delay to let browser finalize selection
      setTimeout(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim() ?? '';

        if (!text || !containerRef.current) {
          return;
        }

        // Check if selection is within our container
        const range = sel?.getRangeAt(0);
        if (!range || !containerRef.current.contains(range.commonAncestorContainer)) {
          return;
        }

        const rect = range.getBoundingClientRect();
        
        // Extract all line rects for multi-line highlighting
        const rects = Array.from(range.getClientRects()).map(r => ({
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height,
        }));

        setSelection({ text, range, rects });
        setPosition({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + window.scrollY - 8,
        });

        // Apply persistent visual highlight using CSS Custom Highlight API
        if (typeof CSS !== 'undefined' && 'highlights' in CSS) {
          try {
            const highlight = new Highlight(range);
            CSS.highlights.set('lingo-selection', highlight);
          } catch(e) {}
        }
      }, 10);
    };

    const enforceSelection = () => {
      if (selection?.range) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount === 0) {
          sel.addRange(selection.range);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', enforceSelection);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', enforceSelection);
    };
  }, [containerRef, selection]);

  return { selection, position, clearSelection };
}
