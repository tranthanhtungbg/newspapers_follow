"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { UrlInput } from "@/components/reader/UrlInput";
import { ArticleRenderer } from "@/components/reader/ArticleRenderer";
import { ReadingModeToggle } from "@/components/reader/ReadingModeToggle";
import { AppearanceSettings } from "@/components/ui/AppearanceSettings";
import { PdfViewer } from "@/components/reader/PdfViewer";
import { TtsPlayer } from "@/components/reader/TtsPlayer";
import { SkeletonText } from "@/components/ui/skeleton";
import { useReaderStore } from "@/stores/reader.store";
import { useLanguageStore } from "@/stores/language.store";
import { useReader } from "@/hooks/useReader";
import { useMutation } from "@tanstack/react-query";
import { readerApi, libraryApi } from "@/lib/api";
import { formatReadingTime, getDomain } from "@/lib/utils";
import type { TranslationMode } from "@/types/reader.types";
import type { Article } from "@/types/reader.types";

export function ReaderPageClient() {
  const searchParams = useSearchParams();
  const { article, isLoading, error, setArticle, setLoading, setError } = useReaderStore();
  const { fetchArticle } = useReader();
  const { targetLang } = useLanguageStore();
  const [mode, setMode] = useState<TranslationMode>("select");
  const fetchedUrlRef = useRef<string | null>(null);

  // PDF viewer state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBannerDismissed, setPdfBannerDismissed] = useState(false);

  const pdfMutation = useMutation({
    mutationFn: (file: File) => readerApi.uploadPdf(file),
    onMutate: () => { setLoading(true); setError(null); },
    onSuccess: (res) => {
      const data = res.data.data as Article;
      setArticle(data);
      setPdfFile(null); // close PDF viewer → show reader

      // Auto-save PDF to Library
      libraryApi.create({
        url: data.url || `file://${pdfFile?.name || 'pdf'}`,
        title: data.title || pdfFile?.name || 'Uploaded PDF',
        type: 'pdf',
      }).catch(() => {});
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to parse PDF.';
      setError(message);
    },
    onSettled: () => setLoading(false),
  });

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && urlParam !== fetchedUrlRef.current) {
      fetchedUrlRef.current = urlParam;
      fetchArticle(urlParam);
    }
  }, [searchParams, fetchArticle]);

  const isPdfOpen = !!pdfFile;

  return (
    // Use a flex column layout so the PDF viewer fills available space naturally
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-3">
          {/* URL input — hidden when PDF is open to save space */}
          {!isPdfOpen && (
            <UrlInput className="flex-1 max-w-xl" onPdfSelect={setPdfFile} />
          )}

          {/* PDF breadcrumb — shown when PDF viewer is open */}
          {isPdfOpen && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="text-red-500 flex-shrink-0">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{pdfFile?.name}</span>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {pdfFile ? `${(pdfFile.size / 1024).toFixed(0)} KB` : ''}
              </span>

              {/* Open in new tab */}
              <button
                onClick={() => setPdfFile(null)}
                className="ml-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                title="Close PDF viewer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                Close
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {isPdfOpen && (
              /* Reader Mode button inside toolbar when PDF open */
              <button
                onClick={() => pdfMutation.mutate(pdfFile!)}
                disabled={pdfMutation.isPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-60"
              >
                {pdfMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Extracting text...
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

            {!isPdfOpen && (
              <div className="hidden sm:flex items-center gap-2">
                <ReadingModeToggle mode={mode} onModeChange={setMode} />
                <AppearanceSettings />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── PDF Viewer — takes remaining viewport height ── */}
      {isPdfOpen && (
        <div className="flex-1 flex flex-col overflow-hidden"
             style={{ height: 'calc(100vh - 3.5rem - 41px)' }}>

          {/* Info banner */}
          {!pdfMutation.isPending && !pdfBannerDismissed && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b-2 border-amber-300 dark:border-amber-700 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-amber-700 dark:text-amber-200">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-200">
                Chế độ PDF Viewer — chưa hỗ trợ dịch từ &amp; pin vocabulary.
              </span>
              <button
                onClick={() => pdfMutation.mutate(pdfFile!)}
                className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                </svg>
                Chuyển sang Reader Mode
              </button>
              <button
                onClick={() => setPdfBannerDismissed(true)}
                className="flex-shrink-0 text-amber-500 hover:text-amber-800 dark:hover:text-amber-200 p-1 rounded"
                title="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}

          {/* Native iframe viewer */}
          <PdfViewerInline file={pdfFile!} />
        </div>
      )}

      {/* ── Article content area ── */}
      {!isPdfOpen && (
        <div className="max-w-4xl mx-auto px-4 w-full">
          {error && (
            <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="py-12 max-w-3xl mx-auto space-y-4">
              <SkeletonText lines={1} />
              <div className="h-2" />
              <SkeletonText lines={6} />
              <SkeletonText lines={4} />
              <SkeletonText lines={5} />
            </div>
          )}

          {!isLoading && article && (
            <>
              <div className="max-w-3xl mx-auto pt-8 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3">
                  {article.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    🌐{" "}
                    <a href={article.url} target="_blank" rel="noopener noreferrer"
                      className="hover:underline hover:text-blue-500">
                      {getDomain(article.url)}
                    </a>
                  </span>
                  <span>{formatReadingTime(article.readingTime)}</span>
                  {article.lang && (
                    <span>Detected: <strong>{article.lang.toUpperCase()}</strong></span>
                  )}
                </div>
              </div>
              <ArticleRenderer article={article} targetLang={targetLang} mode={mode} />
            </>
          )}

          {!isLoading && !article && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-6">📖</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Paste an article URL to begin
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm">
                Supports news sites, blogs, Wikipedia, Medium, and most public
                content. Hover or click words to translate them instantly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating TTS Player */}
      {!isLoading && article && !isPdfOpen && (
        <TtsPlayer htmlContent={article.content} lang={article.lang} />
      )}
    </div>
  );
}

// ── Inline PDF viewer (iframe only, no toolbar — toolbar is in the page header above) ──
function PdfViewerInline({ file }: { file: File }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!objectUrl) return (
    <div className="flex items-center justify-center h-full text-gray-400 gap-2">
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      Loading PDF...
    </div>
  );

  return (
    <iframe
      src={objectUrl}
      className="w-full h-full border-0 flex-1"
      title={file.name}
    />
  );
}
