'use client';

import { useLibrary } from '@/hooks/useLibrary';
import { SkeletonList } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export function LibraryList() {
  const { data, isLoading, deleteResource } = useLibrary({ limit: 50 });
  const router = useRouter();

  if (isLoading) {
    return <SkeletonList count={5} />;
  }

  const articles = data?.data || [];

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your library is empty</h3>
        <p className="text-gray-500 mb-6">Articles you read will automatically be saved here.</p>
        <Button onClick={() => router.push('/reader')}>Go to Reader</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((item) => (
        <div 
          key={item.id} 
          className="flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            if (item.type === 'youtube') {
              router.push(`/video?url=${encodeURIComponent(item.url)}`);
            } else if (item.type === 'pdf') {
              alert("PDF files are processed locally on your device and cannot be automatically re-opened from history yet. Please upload the file again in the Reader.");
            } else {
              router.push(`/reader?url=${encodeURIComponent(item.url)}`);
            }
          }}
        >
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                {item.title || item.url}
              </h3>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-4">
              {new URL(item.url).hostname}
            </p>
            
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </span>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Remove from history?')) {
                    deleteResource(item.id);
                  }
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                aria-label="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
