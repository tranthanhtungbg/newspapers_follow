import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { Redis } from 'ioredis';
import { ScraperService } from './scraper.service';
import { AiService } from '../translation/ai.service';
import { createHash } from 'crypto';
import type { Article, ArticleSummary } from './reader.types';

const CACHE_TTL_SECONDS = 3600; // 1 hour

@Injectable()
export class ReaderService {
  private readonly logger = new Logger(ReaderService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly scraper: ScraperService,
    private readonly ai: AiService,
  ) {}

  async fetchArticle(url: string, ip?: string, user?: any): Promise<Article> {
    // Guest limit check
    if (!user && ip) {
      const today = new Date().toISOString().split('T')[0];
      const key = `guest_fetch:${ip}:${today}`;
      const count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, 86400); // expire after 24h
      if (count > 5) {
        throw new ForbiddenException('Guest limit reached. Please register or sign in to read unlimited articles.');
      }
    }

    const normalized = this.normalizeUrl(url);
    const urlHash = createHash('sha256').update(normalized).digest('hex');

    // Helper to log history for authenticated users
    const logHistory = async (article: any) => {
      const userId = user?.id || user?.sub;
      if (!userId) return;

      try {
        const existing = await this.prisma.savedResource.findFirst({
          where: { userId, url },
        });

        if (existing) {
          await this.prisma.savedResource.update({
            where: { id: existing.id },
            data: { updatedAt: new Date() },
          });
        } else {
          await this.prisma.savedResource.create({
            data: {
              userId,
              url,
              title: article.title || 'Unknown Article',
              type: 'article',
            },
          });
        }
      } catch (e) {
        this.logger.error(`Error in logHistory: ${e.message}`, e.stack);
      }
    };

    // 1. Check Redis cache first
    const cached = await this.redis.get(`article:${urlHash}`);
    if (cached) {
      this.logger.debug(`Cache hit: ${urlHash}`);
      const article = JSON.parse(cached);
      await logHistory(article);
      return article;
    }

    // 2. Check DB cache
    const dbCached = await this.prisma.cachedArticle.findUnique({
      where: { urlHash },
    });

    if (dbCached && dbCached.expiresAt > new Date()) {
      const article = this.mapDbToArticle(dbCached);
      await this.redis.setex(`article:${urlHash}`, CACHE_TTL_SECONDS, JSON.stringify(article));
      await logHistory(article);
      return article;
    }

    // 3. Scrape
    this.logger.log(`Scraping: ${url}`);
    const scraped = await this.scraper.scrape(url);

    if (!scraped.content || scraped.content.length < 100) {
      throw new BadRequestException('Could not extract readable content from this URL');
    }

    // 4. Estimate reading time
    const wordCount = scraped.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    // 5. Store in DB
    const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000);
    const saved = await this.prisma.cachedArticle.upsert({
      where: { urlHash },
      create: {
        urlHash,
        url,
        title: scraped.title,
        content: scraped.content,
        lang: scraped.lang,
        metadata: scraped.metadata as object,
        readingTimeMinutes,
        expiresAt,
      },
      update: {
        title: scraped.title,
        content: scraped.content,
        lang: scraped.lang,
        metadata: scraped.metadata as object,
        readingTimeMinutes,
        cachedAt: new Date(),
        expiresAt,
      },
    });

    const article = this.mapDbToArticle(saved);

    // 6. Cache in Redis
    await this.redis.setex(`article:${urlHash}`, CACHE_TTL_SECONDS, JSON.stringify(article));
    await logHistory(article);

    return article;
  }

  async summarize(
    articleId: string,
    targetLang: string,
    level: 'brief' | 'medium' | 'detailed',
  ): Promise<ArticleSummary> {
    const article = await this.prisma.cachedArticle.findUniqueOrThrow({
      where: { id: articleId },
    });

    const cacheKey = `summary:${articleId}:${targetLang}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const summary = await this.ai.summarize(article.content, targetLang);
    await this.redis.setex(cacheKey, 3600, JSON.stringify(summary));
    return summary;
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      u.hash = '';
      return u.toString().replace(/\/$/, '');
    } catch {
      return url;
    }
  }

  private mapDbToArticle(db: {
    id: string;
    url: string;
    title: string | null;
    content: string;
    lang: string | null;
    metadata: unknown;
    readingTimeMinutes: number | null;
  }): Article {
    return {
      articleId: db.id,
      url: db.url,
      title: db.title ?? 'Untitled',
      content: db.content,
      lang: db.lang ?? 'en',
      readingTime: db.readingTimeMinutes ?? 0,
      metadata: (db.metadata as Record<string, unknown>) ?? {},
    };
  }
}
