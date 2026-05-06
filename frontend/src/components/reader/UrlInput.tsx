'use client';

import { useState, useRef } from 'react';
import { useReader } from '@/hooks/useReader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);

interface UrlInputProps {
  className?: string;
}

const EXAMPLE_URLS = [
  'https://www.bbc.com/news/world',
  'https://techcrunch.com',
  'https://medium.com',
];

export function UrlInput({ className }: UrlInputProps) {
  const [inputVal, setInputVal] = useState('');
  const { fetchArticle, isLoading } = useReader();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    fetchArticle(inputVal.trim());
  };

  const handleExampleClick = (url: string) => {
    setInputVal(url);
    fetchArticle(url);
  };

  const isValidUrl = inputVal.startsWith('http://') || inputVal.startsWith('https://');

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200',
            'bg-white dark:bg-gray-900 shadow-lg',
            inputVal
              ? 'border-blue-400 dark:border-blue-600'
              : 'border-gray-200 dark:border-gray-700',
            'focus-within:border-blue-500 dark:focus-within:border-blue-500',
          )}
        >
          <span className="text-gray-400 dark:text-gray-500 flex-shrink-0">
            <LinkIcon />
          </span>

          <input
            ref={inputRef}
            id="url-input"
            type="url"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Paste any article URL to start reading..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400 dark:placeholder:text-gray-600
                       text-sm focus:outline-none min-w-0"
            autoComplete="off"
            spellCheck={false}
          />

          {inputVal && (
            <button
              type="button"
              onClick={() => { setInputVal(''); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              aria-label="Clear URL"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          <Button
            type="submit"
            size="sm"
            loading={isLoading}
            disabled={!isValidUrl || isLoading}
            className="flex-shrink-0 gap-2"
          >
            <SendIcon />
            Read
          </Button>
        </div>
      </form>

      {/* Example URLs */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">Try:</span>
        {EXAMPLE_URLS.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => handleExampleClick(url)}
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400
                       dark:hover:text-blue-300 hover:underline transition-colors"
          >
            {new URL(url).hostname.replace('www.', '')}
          </button>
        ))}
      </div>
    </div>
  );
}
