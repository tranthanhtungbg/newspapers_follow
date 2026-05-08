import { Suspense } from 'react';
import { VideoPageClient } from './VideoPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Reader - LingoReader',
  description: 'Watch YouTube videos with dual subtitles and vocabulary extraction.',
};

export default function VideoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VideoPageClient />
    </Suspense>
  );
}
