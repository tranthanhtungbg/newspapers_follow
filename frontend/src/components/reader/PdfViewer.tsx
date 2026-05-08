'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  file: File;
  onClose?: () => void;
  onReaderMode?: () => void;
  isConverting?: boolean;
}

export function PdfViewer({ file, onClose, onReaderMode, isConverting }: PdfViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Create a blob URL from the File object — browser renders it natively
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setIsLoading(false);

    // Cleanup when component unmounts or file changes
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Custom toolbar above the native viewer */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {/* PDF icon + filename */}
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-red-500 flex-shrink-0">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate flex-1" title={file.name}>
          {file.name}
        </span>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {(file.size / 1024).toFixed(0)} KB
        </span>

        {/* Reader Mode button */}
        {onReaderMode && (
          <button
            onClick={onReaderMode}
            disabled={isConverting}
            className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-60 flex-shrink-0"
          >
            {isConverting ? (
              <>
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Converting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
                Reader Mode
              </>
            )}
          </button>
        )}

        {/* Open in new tab */}
        {objectUrl && (
          <a
            href={objectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0 flex items-center gap-1"
            title="Open in new tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            New tab
          </a>
        )}

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 flex-shrink-0"
            onClick={onClose}
            title="Close PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </Button>
        )}
      </div>

      {/* Native browser PDF viewer via iframe */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Loading PDF...
            </div>
          </div>
        )}

        {objectUrl && (
          <iframe
            ref={iframeRef}
            src={objectUrl}
            className="w-full h-full border-0"
            title={file.name}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
