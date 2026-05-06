'use client';

import { useState, useEffect } from 'react';
import { useFlashcards } from '@/hooks/useFlashcards';
import { FlashcardItem } from './FlashcardItem';
import { SkeletonList } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StudySession() {
  const [cramMode, setCramMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { cards: rawCards, stats, isLoading, submitReview } = useFlashcards(cramMode, selectedDate || undefined);
  
  const [cards, setCards] = useState<typeof rawCards>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });

  // Sync cards when API data changes
  useEffect(() => {
    setCards(rawCards || []);
    setCurrentIndex(0);
    setSessionComplete(false);
  }, [rawCards]);

  const currentCard = cards[currentIndex];
  const remaining = cards.length - currentIndex;

  const handleShuffle = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleRate = async (vocabId: string, score: number, durationMs: number) => {
    await submitReview({ id: vocabId, score, durationMs });

    if (score >= 3) {
      setSessionStats((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setSessionStats((s) => ({ ...s, incorrect: s.incorrect + 1 }));
    }

    if (currentIndex >= cards.length - 1) {
      setSessionComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (isLoading) return <SkeletonList count={1} />;

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          All caught up!
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          No cards due for review today. Come back tomorrow!
        </p>
        {stats && (
          <div className="mt-6 inline-flex items-center gap-4 bg-gray-50 dark:bg-gray-800
                          px-6 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300">
            <span>🔥 {stats.streak} day streak</span>
            <span>📚 {stats.masteredCount} mastered</span>
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={() => setCramMode(true)}>
            Practice anyway
          </Button>
          <p className="text-xs text-gray-400 mt-2 mb-4">Review cards before their scheduled time</p>
          
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Or practice by date added:</span>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) setCramMode(true);
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const total = sessionStats.correct + sessionStats.incorrect;
    const accuracy = total > 0 ? Math.round((sessionStats.correct / total) * 100) : 0;

    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="text-5xl mb-4">{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '💪' : '📖'}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Great job reviewing today.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Correct', value: sessionStats.correct, color: 'text-green-600' },
            { label: 'Incorrect', value: sessionStats.incorrect, color: 'text-red-500' },
            { label: 'Accuracy', value: `${accuracy}%`, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className={cn('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Button onClick={() => { setCurrentIndex(0); setSessionComplete(false); setSessionStats({ correct: 0, incorrect: 0 }); }}>
          {cramMode ? "Practice Again" : "Review Again"}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Date</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value) setCramMode(true);
            }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShuffle}
          className="gap-2 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8"></polyline>
            <line x1="4" y1="20" x2="21" y2="3"></line>
            <polyline points="21 16 21 21 16 21"></polyline>
            <line x1="15" y1="15" x2="21" y2="21"></line>
            <line x1="4" y1="4" x2="9" y2="9"></line>
          </svg>
          Shuffle
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-6 w-full text-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Previous
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNext} 
          disabled={currentIndex === cards.length - 1}
          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          Next →
        </Button>
      </div>

      {currentCard && (
        <FlashcardItem
          key={currentCard.id}
          card={currentCard}
          onRate={handleRate}
          totalRemaining={remaining}
          currentIndex={currentIndex}
        />
      )}
    </div>
  );
}
