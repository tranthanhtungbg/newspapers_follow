import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, BookOpen, Sparkles, BookMarked, Layers, Volume2, Moon,
  Newspaper, Zap, Globe2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'LingoReader — Learn Languages by Reading Real Content',
  description:
    'Paste any article URL and learn vocabulary in context with AI-powered contextual translation and spaced repetition.',
};

const FEATURES = [
  {
    icon: Newspaper,
    title: 'Read Any URL',
    description: 'Paste any news article, blog, or Wikipedia page. We strip ads and render clean, beautiful content.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI Contextual Translation',
    description: 'Click any word for instant translation with IPA, context meaning, examples, and collocations.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: BookMarked,
    title: 'Vocabulary Saving',
    description: 'One click to save any word with full context, sentence, and source article URL.',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    icon: Layers,
    title: 'Spaced Repetition',
    description: 'Review with the SM-2 flashcard algorithm — scientifically the best way to memorize.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Volume2,
    title: 'Text-to-Speech',
    description: 'Hear native pronunciation for any word, phrase, or example sentence.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Moon,
    title: 'Comfort Reading',
    description: 'Dark mode, custom fonts, line spacing, and reading width for long sessions.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
];

const STATS = [
  { value: '50+', label: 'Languages' },
  { value: 'AI', label: 'Powered' },
  { value: 'Free', label: 'To Start' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-background to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/10" />
          <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <Zap className="h-3 w-3 text-yellow-500" />
            Comprehensible Input Learning
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
            Learn languages by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              reading real content
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste any news article, blog post, or Wikipedia page. Get instant AI translations,
            save vocabulary in context, and review with spaced repetition flashcards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
            <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/25">
              <Link href="/reader">
                Start Reading Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn/phonetics">
                <Globe2 className="h-4 w-4 mr-2" />
                Browse Guides
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="inline-flex items-center gap-8 bg-muted/50 border border-border rounded-full px-8 py-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Everything you need to learn faster
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete language learning environment built around the content you already love to read.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card key={f.title} className="border-border/50 hover:border-border hover:shadow-md transition-all duration-200 group">
                <CardContent className="p-6">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.bg} mb-4`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to start reading?
          </h2>
          <p className="text-muted-foreground mb-8">
            Free forever. No credit card required. Start learning from any article in seconds.
          </p>
          <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/25">
            <Link href="/reader">
              Open Reader <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
