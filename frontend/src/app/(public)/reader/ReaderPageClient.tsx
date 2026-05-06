"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { UrlInput } from "@/components/reader/UrlInput";
import { ArticleRenderer } from "@/components/reader/ArticleRenderer";
import { ReadingModeToggle } from "@/components/reader/ReadingModeToggle";
import { AppearanceSettings } from "@/components/ui/AppearanceSettings";
import { SkeletonText } from "@/components/ui/skeleton";
import { useReaderStore } from "@/stores/reader.store";
import { useLanguageStore } from "@/stores/language.store";
import { useReader } from "@/hooks/useReader";
import { formatReadingTime, getDomain } from "@/lib/utils";
import type { TranslationMode } from "@/types/reader.types";

export function ReaderPageClient() {
  const searchParams = useSearchParams();
  const { article, isLoading, error } = useReaderStore();
  const { fetchArticle } = useReader();
  const { targetLang } = useLanguageStore();
  const [mode, setMode] = useState<TranslationMode>("select");
  const fetchedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && urlParam !== fetchedUrlRef.current) {
      fetchedUrlRef.current = urlParam;
      fetchArticle(urlParam);
    }
  }, [searchParams, fetchArticle]);

  return (
    <div className="min-h-screen">
      {/* Sticky reader toolbar */}
      <div
        className="sticky top-14 z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm
                      border-b border-gray-100 dark:border-gray-800 px-4 py-2"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <UrlInput className="flex-1 max-w-xl" />
          <div className="hidden sm:flex items-center gap-2">
            <ReadingModeToggle mode={mode} onModeChange={setMode} />
            <AppearanceSettings />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Error */}
        {error && (
          <div className="mt-8 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="py-12 max-w-3xl mx-auto space-y-4">
            <SkeletonText lines={1} />
            <div className="h-2" />
            <SkeletonText lines={6} />
            <SkeletonText lines={4} />
            <SkeletonText lines={5} />
          </div>
        )}

        {/* Article */}
        {!isLoading && article && (
          <>
            {/* Article meta */}
            <div className="max-w-3xl mx-auto pt-8 pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3">
                {article.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1">
                  🌐{" "}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-blue-500"
                  >
                    {getDomain(article.url)}
                  </a>
                </span>
                <span>{formatReadingTime(article.readingTime)}</span>
                {article.lang && (
                  <span>
                    Detected: <strong>{article.lang.toUpperCase()}</strong>
                  </span>
                )}
              </div>
            </div>

            <ArticleRenderer
              article={article}
              targetLang={targetLang}
              mode={mode}
            />
          </>
        )}

        {/* Empty state */}
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
    </div>
  );
}
