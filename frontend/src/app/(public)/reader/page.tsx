import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ReaderPageClient } from './ReaderPageClient';

export const metadata: Metadata = {
  title: 'Read & Learn | LingoReader',
  description: 'Paste any article URL and start learning vocabulary in context with AI translation.',
  openGraph: {
    title: 'LingoReader — Read & Learn',
    description: 'Learn languages by reading real content with contextual AI translation.',
    type: 'website',
  },
};

export default function ReaderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ReaderPageClient />
    </Suspense>
  );
}
