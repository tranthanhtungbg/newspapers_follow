export interface Article {
  articleId: string;
  url: string;
  title: string;
  content: string;
  lang: string;
  readingTime: number;
  metadata: Record<string, unknown>;
}

export interface ArticleSummary {
  brief: string;
  medium: string;
  detailed: string;
  keyPoints: string[];
  entities: string[];
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
}
