'use client';

import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { PinIcon, PinOffIcon } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { vocabularyApi } from '@/lib/api';
import { PinCategoryDialog } from '../vocabulary/PinCategoryDialog';
import { cn } from '@/lib/utils';
import type { FlashcardWithVocab } from '@/types/vocabulary.types';

const SCORE_CONFIG = [
  { score: 0, label: 'Blackout', emoji: '💀', color: 'bg-red-600 hover:bg-red-700 text-white' },
  { score: 1, label: 'Wrong',    emoji: '😓', color: 'bg-red-400 hover:bg-red-500 text-white' },
  { score: 2, label: 'Hard',     emoji: '😅', color: 'bg-orange-400 hover:bg-orange-500 text-white' },
  { score: 3, label: 'Good',     emoji: '😊', color: 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' },
  { score: 4, label: 'Easy',     emoji: '😎', color: 'bg-green-400 hover:bg-green-500 text-white' },
  { score: 5, label: 'Perfect',  emoji: '🎯', color: 'bg-green-600 hover:bg-green-700 text-white' },
];

interface Props {
  card: FlashcardWithVocab;
  onRate: (vocabId: string, score: number, durationMs: number) => void;
  totalRemaining: number;
  currentIndex: number;
}

export function FlashcardItem({ card, onRate, totalRemaining, currentIndex }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [startTime] = useState(Date.now());
  const { play, isPlaying } = useAudio({ lang: card.vocab.sourceLang });
  const qc = useQueryClient();
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  const { data: pins = [] } = useQuery({
    queryKey: ['pinned-vocabulary'],
    queryFn: () => vocabularyApi.getPins().then((res) => res.data.data as any[]),
  });

  const isPinned = pins.some((p) => p.vocabId === card.vocabId);

  const togglePin = async (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (isPinned) {
        await vocabularyApi.unpin(card.vocabId);
        qc.invalidateQueries({ queryKey: ['pinned-vocabulary'] });
      } else {
        setIsPinDialogOpen(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle pin', err);
    }
  };

  const handleRate = (score: number) => {
    onRate(card.vocabId, score, Date.now() - startTime);
    setFlipped(false);
  };

  // Swipe logic
  const x = useMotionValue(0);
  const rotateZ = useTransform(x, [-200, 200], [-10, 10]);
  const opacityRight = useTransform(x, [50, 150], [0, 1]);
  const opacityLeft = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 120) {
      handleRate(4); // Swipe right = Easy/Good
    } else if (info.offset.x < -120) {
      handleRate(1); // Swipe left = Wrong
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Progress & Pin */}
      <div className="w-full flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">{totalRemaining} cards remaining</span>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            Click to reveal
          </span>
          <button 
            onClick={togglePin}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              isPinned 
                ? "text-amber-500 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60" 
                : "text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            )}
            title={isPinned ? "Unpin word" : "Pin word"}
          >
            {isPinned ? <PinIcon className="h-4 w-4 fill-current" /> : <PinOffIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Card flip & drag */}
      <motion.div
        className="w-full min-h-[320px] cursor-grab active:cursor-grabbing relative"
        style={{ perspective: '1200px', x, rotateZ }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        onClick={() => setFlipped(!flipped)}
        whileTap={{ scale: 0.98 }}
      >
        {/* Swipe Overlays */}
        <motion.div 
          style={{ opacity: opacityRight }} 
          className="absolute top-8 left-8 z-20 pointer-events-none rotate-[-15deg] border-4 border-green-500 text-green-500 font-bold text-3xl px-4 py-1 rounded-xl uppercase tracking-widest bg-white/80 dark:bg-gray-900/80"
        >
          KNOW IT
        </motion.div>
        <motion.div 
          style={{ opacity: opacityLeft }} 
          className="absolute top-8 right-8 z-20 pointer-events-none rotate-[15deg] border-4 border-red-500 text-red-500 font-bold text-3xl px-4 py-1 rounded-xl uppercase tracking-widest bg-white/80 dark:bg-gray-900/80"
        >
          WRONG
        </motion.div>

        <motion.div
          className="w-full h-full grid"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="col-start-1 row-start-1 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl
                          bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800
                          shadow-lg backface-hidden z-10 select-none"
               style={{ minHeight: '320px' }}>
            <div className="flex flex-col items-center gap-3 mb-2 w-full justify-center">
              <h2 className={cn(
                "text-center break-words max-w-full text-gray-900 dark:text-white",
                card.vocab.word.length > 80 ? "text-xl sm:text-2xl font-medium leading-relaxed" : "text-3xl sm:text-4xl font-bold"
              )}>
                {card.vocab.word}
              </h2>
              <button
                onClick={(e) => { e.stopPropagation(); play(card.vocab.word); }}
                className={cn('text-gray-400 hover:text-blue-500 transition-colors', isPlaying && 'text-blue-500')}
                aria-label="Play pronunciation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </button>
            </div>
            {card.vocab.ipa && (
              <p className="text-gray-400 font-mono text-xl mb-3">{card.vocab.ipa}</p>
            )}
            {card.vocab.partOfSpeech && (
              <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500
                               px-3 py-1 rounded-full font-medium">
                {card.vocab.partOfSpeech}
              </span>
            )}
          </div>

          {/* Back */}
          <div
            className="col-start-1 row-start-1 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl
                       bg-gradient-to-br from-blue-50 to-indigo-50
                       dark:from-blue-950/50 dark:to-indigo-950/50
                       border-2 border-blue-100 dark:border-blue-900 shadow-lg backface-hidden"
            style={{ transform: 'rotateY(180deg)', minHeight: '320px' }}
          >
            <div className="my-auto flex flex-col items-center justify-center w-full">
              <p className={cn(
                "text-blue-900 dark:text-blue-100 text-center mb-4 break-words max-w-full",
                card.vocab.translation.length > 80 ? "text-lg sm:text-xl font-medium leading-relaxed" : "text-xl sm:text-2xl font-bold"
              )}>
                {card.vocab.translation}
              </p>
              {card.vocab.examples?.[0] && (
                <div className="text-sm text-center w-full">
                  <p className="text-gray-600 dark:text-gray-400 italic break-words max-w-full">
                    "{card.vocab.examples[0].en}"
                  </p>
                </div>
              )}
            </div>
            {card.vocab.contextSentence && !card.vocab.examples?.[0] && (
              <div className="mt-6 pt-4 text-sm text-center w-full border-t border-blue-100 dark:border-blue-900/50">
                <p className="text-gray-500 dark:text-gray-400 italic break-words max-w-full leading-relaxed">
                  "{card.vocab.contextSentence}"
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <p className="text-xs text-center text-gray-400 mb-3 font-medium uppercase tracking-wider">
              How well did you remember?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {SCORE_CONFIG.map(({ score, label, emoji, color }) => (
                <button
                  key={score}
                  onClick={() => handleRate(score)}
                  className={cn(
                    'py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95',
                    color,
                  )}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PinCategoryDialog
        vocabId={card.vocabId}
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
      />
    </div>
  );
}
