'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookMarked, Layers, Library, Settings2, BookOpen,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const SIDEBAR_LINKS = [
  { href: '/vocabulary', label: 'Vocabulary', icon: BookMarked },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/reader', label: 'Reader', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-0.5 w-52 flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Menu
          </p>
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <Separator className="my-3" />

          <p className="text-xs text-muted-foreground px-3">
            LingoReader v0.1.0
          </p>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border border-border min-h-96 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
