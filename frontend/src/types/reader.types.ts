// =============================================================
// LingoReader — Reader Types
// =============================================================

export interface Article {
  articleId: string;
  url: string;
  title: string;
  content: string;             // sanitized HTML
  lang: string;
  readingTime: number;         // minutes
  metadata: ArticleMetadata;
}

export interface ArticleMetadata {
  author?: string;
  publishedAt?: string;
  image?: string;
  description?: string;
  siteName?: string;
}

export interface FetchArticleRequest {
  url: string;
}

export interface SummarizeRequest {
  articleId: string;
  targetLang: string;
  level: SummaryLevel;
}

export type SummaryLevel = 'brief' | 'medium' | 'detailed';

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

export type TranslationMode = 'hover' | 'select' | 'none';
