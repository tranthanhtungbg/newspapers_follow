import type { Metadata } from 'next';
import { LibraryList } from '@/components/library/LibraryList';

export const metadata: Metadata = {
  title: 'Library | LingoReader',
  description: 'Your saved articles and resources.',
};

export default function LibraryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Library</h1>
        <p className="text-sm text-muted-foreground mt-1">
          History of all articles and resources you have read.
        </p>
      </div>
      <LibraryList />
    </div>
  );
}
