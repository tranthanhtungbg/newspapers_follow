'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { grammarApi, GrammarTopic } from '@/lib/api/grammar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function GrammarRoadmapPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    grammarApi.getRoadmap()
      .then(data => {
        setTopics(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      case 'ADVANCED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      default: return '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Grammar Roadmap
        </h1>
        <p className="text-muted-foreground">
          Master English grammar from basic to advanced levels. Complete lessons to unlock the next topics.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">No Grammar Topics Yet</h2>
          <p className="text-muted-foreground text-sm">
            Admin has not added any grammar topics yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-8 relative">
          {/* A simple vertical line connecting topics */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border -z-10 hidden md:block" />

          {topics.map((topic, tIdx) => {
            const isTopicCompleted = topic.lessons.length > 0 && topic.lessons.every(l => l.isCompleted);
            const completedLessonsCount = topic.lessons.filter(l => l.isCompleted).length;

            return (
              <Card key={topic.id} className={cn("relative overflow-hidden transition-all", isTopicCompleted ? 'border-primary/50 bg-primary/5' : '')}>
                <CardHeader className="pb-4 border-b bg-muted/30">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <Badge variant="outline" className={cn("font-medium", getLevelColor(topic.level))}>
                          {topic.level}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-medium">Topic {tIdx + 1}</span>
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                      {topic.description && (
                        <CardDescription className="mt-1.5">{topic.description}</CardDescription>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">
                        Progress: {completedLessonsCount} / {topic.lessons.length}
                      </div>
                      <div className="h-2 w-full md:w-32 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${topic.lessons.length ? (completedLessonsCount / topic.lessons.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topic.lessons.map((lesson, lIdx) => {
                      return (
                        <Link 
                          key={lesson.id} 
                          href={`/grammar/${lesson.id}`}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all hover:border-primary hover:shadow-sm bg-card",
                            lesson.isCompleted && "border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center justify-center h-8 w-8 rounded-full",
                              lesson.isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/50" : 
                              "bg-primary/10 text-primary"
                            )}>
                              {lesson.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {lesson.order}. {lesson.title}
                              </p>
                              {lesson.isCompleted && lesson.score !== null && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                  Score: {lesson.score}/100
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    
                    {topic.lessons.length === 0 && (
                      <div className="col-span-full text-center py-4 text-sm text-muted-foreground italic">
                        Lessons are coming soon...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
