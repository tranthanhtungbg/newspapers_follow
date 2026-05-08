'use client';

import { useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { useVocabulary } from '@/hooks/useVocabulary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TranslationResult } from '@/types/translation.types';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguageStore } from '@/stores/language.store';
import { PinCategoryDialog } from '@/components/vocabulary/PinCategoryDialog';

const SpeakerIcon = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const PinIcon = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 17v5M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

interface Props {
  word: string;
  result: TranslationResult;
  sourceUrl?: string;
  contextSentence?: string;
  onClose?: () => void;
}

export function TranslationCard({ word, result, sourceUrl, contextSentence, onClose }: Props) {
  const [showExamples, setShowExamples] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [vocabId, setVocabId] = useState<string | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { sourceLang, targetLang } = useLanguageStore();
  const { saveVocab, isSaving, unpinVocab, isPinning } = useVocabulary();
  const { play, isPlaying } = useAudio({ lang: sourceLang });

  const handleSave = async () => {
    if (!isAuthenticated || saved) return vocabId;
    const item = await saveVocab({
      word,
      translation: result.translation,
      ipa: result.ipa,
      partOfSpeech: result.partOfSpeech,
      contextMeaning: result.contextMeaning,
      alternativeMeanings: result.alternativeMeanings,
      register: result.register,
      examples: result.examples,
      collocations: result.collocations,
      contextSentence: contextSentence,
      contextUrl: sourceUrl,
      sourceLang,
      targetLang,
    });
    setSaved(true);
    setVocabId(item.id);
    return item.id;
  };

  const handlePin = async () => {
    if (!isAuthenticated) return;
    let id = vocabId;
    if (!id) {
      id = await handleSave();
    }
    if (id) {
      if (pinned) {
        await unpinVocab(id);
        setPinned(false);
      } else {
        setIsPinDialogOpen(true);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-80
                    border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{word}</h3>
            <button
              aria-label="Play pronunciation"
              onClick={() => play(word)}
              className={cn(
                'text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex-shrink-0',
                isPlaying && 'text-blue-500',
              )}
            >
              <SpeakerIcon />
            </button>
          </div>
          {result.ipa && (
            <p className="text-xs text-gray-500/80 dark:text-gray-400/80 font-mono mt-1 line-clamp-2" title={result.ipa}>
              {result.ipa}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <Badge variant="secondary">{result.partOfSpeech}</Badge>
          {result.register && result.register !== 'neutral' && (
            <Badge variant="outline">{result.register}</Badge>
          )}
          
          {isAuthenticated && (
            <button
              onClick={handlePin}
              disabled={isPinning}
              aria-label="Pin"
              className={cn(
                "ml-1 p-1 transition-colors rounded-md",
                pinned ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              )}
            >
              <PinIcon filled={pinned} />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="ml-1 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XIcon />
            </button>
          )}
        </div>
      </div>

      {/* Translation */}
      <div className="mx-5 mb-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl p-3">
        <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm">
          {result.translation}
        </p>
        {result.contextMeaning && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            In context: {result.contextMeaning}
          </p>
        )}
      </div>

      {/* Alternative meanings */}
      {result.alternativeMeanings?.length > 0 && (
        <div className="px-5 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Also means</p>
          <div className="flex flex-wrap gap-1">
            {result.alternativeMeanings.map((m, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800
                                       text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Examples toggle */}
      {result.examples?.length > 0 && (
        <div className="px-5 mb-3">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showExamples ? '▲ Hide' : '▼ Show'} examples ({result.examples.length})
          </button>
          {showExamples && (
            <div className="mt-2 space-y-2">
              {result.examples.map((ex, i) => (
                <div key={i} className="text-xs border-l-2 border-blue-200 dark:border-blue-800 pl-2.5">
                  <p className="text-gray-700 dark:text-gray-300 italic">{ex.en}</p>
                  {ex[targetLang] && (
                    <p className="text-gray-500 dark:text-gray-500 mt-0.5">{ex[targetLang]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collocations */}
      {result.collocations?.length > 0 && (
        <div className="px-5 mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Common phrases</p>
          <div className="flex flex-wrap gap-1">
            {result.collocations.map((c, i) => (
              <span key={i} className="text-xs text-purple-600 dark:text-purple-400
                                       bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Save footer */}
      {isAuthenticated && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant={saved ? 'secondary' : 'default'}
            size="sm"
            loading={isSaving}
            disabled={saved}
            onClick={handleSave}
            className="w-full justify-center gap-2"
          >
            <BookmarkIcon filled={saved} />
            {saved ? 'Saved to Vocabulary' : 'Save to Vocabulary'}
          </Button>
        </div>
      )}

      {vocabId && (
        <PinCategoryDialog
          vocabId={vocabId}
          isOpen={isPinDialogOpen}
          onClose={() => setIsPinDialogOpen(false)}
          onPinSuccess={() => setPinned(true)}
        />
      )}
    </div>
  );
}
