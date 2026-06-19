'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, PlayCircle, Loader2, BookOpen } from 'lucide-react';
import { grammarApi, GrammarLesson } from '@/lib/api/grammar';
import { TtsPlayer } from '@/components/reader/TtsPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    grammarApi.getLesson(params.id)
      .then(data => {
        setLesson(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load lesson');
        setIsLoading(false);
      });
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Lesson not found.
      </div>
    );
  }

  // Simple Markdown to HTML parser
  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 text-primary border-b pb-2">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3 text-primary/80">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-muted-foreground">$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc mb-1.5">$1</li>');
    
    html = html.replace(/(<li.*<\/li>\n?)+/gim, '<ul class="mb-5 bg-muted/30 p-4 rounded-xl border border-muted/50">$&</ul>');
    html = html.replace(/\n\n/gim, '<br/><br/>');
    
    return html;
  };

  const htmlContent = parseMarkdown(lesson.content);
  const exercises = lesson.exercises as { question: string, answer: string }[] || [];

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const checkAnswersAndComplete = async () => {
    setShowResults(true);
    let correct = 0;
    
    exercises.forEach((ex, idx) => {
      const userAns = (answers[idx] || '').trim().toLowerCase();
      // Allow splitting multiple correct answers if separated by '/'
      const expectedAnswers = ex.answer.split('/').map(a => a.trim().toLowerCase());
      
      const isCorrect = expectedAnswers.some(expected => 
        userAns === expected || (expected.includes(userAns) && userAns.length > 2)
      );

      if (isCorrect) correct++;
    });

    const score = exercises.length > 0 ? Math.round((correct / exercises.length) * 100) : 100;
    
    try {
      setIsSubmitting(true);
      await grammarApi.markCompleted(lesson.id, score);
      alert(`🎉 Lesson Completed! You scored ${score}%`);
      setTimeout(() => {
        router.push('/grammar');
      }, 2000);
    } catch (err) {
      alert('Error: Failed to save progress');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/grammar')}
        className="mb-6 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Roadmap
      </Button>

      <Card className="mb-8 border-none shadow-sm bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <BookOpen className="w-32 h-32" />
        </div>
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3 text-primary mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
              {lesson.order}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider">Grammar Lesson</span>
          </div>
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {lesson.title}
          </CardTitle>
          {lesson.progress?.isCompleted && (
            <div className="flex items-center gap-2 mt-5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 w-fit px-4 py-1.5 rounded-full text-sm font-medium border border-green-200 dark:border-green-900/50">
              <CheckCircle2 className="w-5 h-5" />
              Completed (Score: {lesson.progress.score}%)
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-8">
        {/* Content Section */}
        <div 
          id="reader-content"
          className="prose prose-lg dark:prose-invert max-w-none leading-relaxed bg-card p-6 md:p-10 rounded-2xl shadow-sm border border-border/50 text-foreground/90"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Exercises Section */}
        {exercises.length > 0 && (
          <Card className="border-primary/20 shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-5">
              <CardTitle className="text-xl flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-primary" />
                Practice Exercises
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {exercises.map((ex, idx) => {
                let isCorrect = false;
                if (showResults) {
                  const userAns = (answers[idx] || '').trim().toLowerCase();
                  const expectedAnswers = ex.answer.split('/').map(a => a.trim().toLowerCase());
                  isCorrect = expectedAnswers.some(expected => 
                    userAns === expected || (expected.includes(userAns) && userAns.length > 2)
                  );
                }
                const isWrong = showResults && !isCorrect;
                
                return (
                  <div key={idx} className="space-y-4 bg-muted/10 p-5 rounded-xl border border-border/50">
                    <p className="font-medium text-lg leading-relaxed">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm font-bold mr-3">{idx + 1}</span> 
                      {ex.question.replace('___', '_______')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pl-9">
                      <Input
                        placeholder="Type your answer..."
                        value={answers[idx] || ''}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className={cn(
                          "max-w-xs transition-all duration-300 text-base py-5",
                          isCorrect && "border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 ring-1 ring-green-500/50",
                          isWrong && "border-red-500 bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-300 ring-1 ring-red-500/50"
                        )}
                        disabled={showResults}
                      />
                      {showResults && (
                        <div className={cn("text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95", isCorrect ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "text-red-600 bg-red-100 dark:bg-red-900/30")}>
                          {isCorrect ? (
                            <><CheckCircle2 className="w-4 h-4" /> Correct!</>
                          ) : (
                            <span>✗ Incorrect. Expected: <b className="ml-1 px-2 py-0.5 bg-red-200/50 dark:bg-red-950/50 rounded">{ex.answer}</b></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end mt-6">
          <Button 
            size="lg" 
            onClick={checkAnswersAndComplete} 
            disabled={isSubmitting || showResults}
            className="w-full md:w-auto text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
            {showResults ? 'Lesson Completed' : 'Submit & Complete Lesson'}
          </Button>
        </div>
      </div>

      {/* TTS Reader Component */}
      <TtsPlayer htmlContent={htmlContent} lang="vi-VN" />
    </div>
  );
}
