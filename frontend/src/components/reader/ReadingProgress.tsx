'use client';

import { useEffect, useState, useRef, RefObject } from 'react';

export function ReadingProgress({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalHeight = container.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrolled = window.scrollY + viewportHeight - container.offsetTop;
      const pct = Math.min(Math.max((scrolled / totalHeight) * 100, 0), 100);
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [containerRef]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100 dark:bg-gray-800"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
