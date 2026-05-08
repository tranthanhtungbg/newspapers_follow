'use client';

import { useState, useRef, useCallback } from 'react';
import { useReader } from '@/hooks/useReader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReaderStore } from '@/stores/reader.store';

// ── Icons ────────────────────────────────────────────────────────
const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M9 13h1a1 1 0 0 1 0 2H9v-2z"/>
    <path d="M12 13h1.5a1.5 1.5 0 0 1 0 3H12v-3z"/>
    <path d="M16 13v3"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────
interface UrlInputProps {
  className?: string;
  onPdfSelect?: (file: File) => void;
}

const EXAMPLE_URLS = [
  'https://www.bbc.com/news/world',
  'https://techcrunch.com',
  'https://medium.com',
];

type Tab = 'url' | 'pdf';

export function UrlInput({ className, onPdfSelect }: UrlInputProps) {
  const [tab, setTab] = useState<Tab>('url');

  // URL tab state
  const [inputVal, setInputVal] = useState('');
  const { fetchArticle, isLoading } = useReader();
  const inputRef = useRef<HTMLInputElement>(null);

  // PDF tab state — only drop zone UI, state is lifted to parent
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setError } = useReaderStore();

  // URL handlers
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    fetchArticle(inputVal.trim());
  };

  const handleExampleClick = (url: string) => {
    setInputVal(url);
    fetchArticle(url);
  };

  const isValidUrl = inputVal.startsWith('http://') || inputVal.startsWith('https://');

  // PDF handlers
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    onPdfSelect?.(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file ?? null);
  }, [onPdfSelect]);

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit mx-auto">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'url'
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <LinkIcon /> Article URL
        </button>
        <button
          type="button"
          onClick={() => setTab('pdf')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
            tab === 'pdf'
              ? 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <PdfIcon /> PDF Upload
        </button>
      </div>

      {/* URL Tab */}
      {tab === 'url' && (
        <>
          <form onSubmit={handleUrlSubmit} className="relative">
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
        </>
      )}

      {/* PDF Tab */}
      {tab === 'pdf' && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-2xl transition-all duration-200 bg-white dark:bg-gray-900',
            dragOver
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-4 pointer-events-none select-none">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
              dragOver ? 'bg-red-100 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            )}>
              <UploadIcon />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Drop your PDF here, or <span className="text-red-500 font-semibold">browse</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Supports most PDF formats · Max 20 MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
