import type { Metadata } from 'next';
import { StudySession } from '@/components/flashcard/StudySession';

export const metadata: Metadata = {
  title: 'Flashcards | LingoReader',
  description: 'Review your saved vocabulary with spaced repetition flashcards.',
};

export default function FlashcardsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Flashcard Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Spaced repetition — review at the optimal moment for long-term retention.
        </p>
      </div>
      <StudySession />
    </div>
  );
}
