'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { AuthInitializer } from '@/components/providers/AuthInitializer';
import { GlobalPinnedVocab } from '@/components/vocabulary/GlobalPinnedVocab';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthInitializer>
          {children}
          <GlobalPinnedVocab />
        </AuthInitializer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
