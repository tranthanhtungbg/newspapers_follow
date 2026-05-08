import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { Redis } from 'ioredis';
import { ScraperService } from './scraper.service';
import { AiService } from '../translation/ai.service';
import { createHash } from 'crypto';
import type { Article, ArticleSummary } from './reader.types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseLib = require('pdf-parse');
const pdfParse: (buffer: Buffer, options?: Record<string, unknown>) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }> =
  typeof pdfParseLib === 'function' ? pdfParseLib : pdfParseLib.default ?? pdfParseLib;

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

  async parsePdf(buffer: Buffer, filename: string, user?: any): Promise<Article> {
    let parsed: any;
    try {
      parsed = await pdfParse(buffer);
    } catch (e) {
      this.logger.error(`pdf-parse failed: ${(e as Error).message}`, (e as Error).stack);
      throw new BadRequestException(`Failed to parse PDF file: ${(e as Error).message}`);
    }

    const rawText = (parsed.text || '').trim();
    if (!rawText || rawText.length < 50) {
      throw new BadRequestException('Could not extract readable text from this PDF. It may be image-based (scanned) or encrypted.');
    }

    const htmlContent = this.convertPdfTextToHtml(rawText);

    const wordCount = rawText.split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const title = filename.replace(/\.pdf$/i, '') || 'Untitled PDF';

    // Store in DB so summarize endpoint can reference it
    const urlHash = createHash('sha256').update(`pdf:${filename}:${Date.now()}`).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days
    const saved = await this.prisma.cachedArticle.create({
      data: {
        urlHash,
        url: `pdf://${filename}`,
        title,
        content: htmlContent,
        lang: 'en',
        metadata: { source: 'pdf', pages: parsed.numpages ?? 0, words: wordCount },
        readingTimeMinutes,
        expiresAt,
      },
    });

    const article = this.mapDbToArticle(saved);
    await this.redis.setex(`article:${urlHash}`, 7 * 24 * 3600, JSON.stringify(article));
    return article;
  }

  private convertPdfTextToHtml(rawText: string): string {
    // Split on single newlines to get individual lines
    const lines = rawText.split('\n');

    const isPageNumber = (line: string) => /^\s*\d+\s*$/.test(line);
    const isAllCaps = (line: string) => line.trim().length > 2 && line.trim() === line.trim().toUpperCase() && /[A-Z]/.test(line);
    const isLikelyHeading = (line: string, nextLine: string) => {
      const t = line.trim();
      if (!t || t.length > 120) return false;
      // Standalone short line followed by blank
      if (nextLine.trim() === '' && t.length < 80 && !t.endsWith(',') && !t.endsWith(';')) return true;
      // ALL CAPS
      if (isAllCaps(t) && t.length < 100) return true;
      // Looks like "Chapter X" or numbered section "1.", "1.1", etc.
      if (/^(chapter|section|part|appendix)\s+/i.test(t)) return true;
      if (/^\d+(\.\d+)*\s+[A-Z]/.test(t) && t.length < 80) return true;
      return false;
    };

    const htmlParts: string[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length === 0) return;
      const text = currentParagraph.join(' ').trim();
      if (text.length > 5) {
        // Detect list items starting with bullet/dash/number
        if (/^[-•*·]\s+/.test(text)) {
          htmlParts.push(`<li>${text.replace(/^[-•*·]\s+/, '')}</li>`);
        } else if (/^\d+[\.\)]\s+/.test(text) && text.length < 300) {
          htmlParts.push(`<li>${text}</li>`);
        } else {
          htmlParts.push(`<p>${text}</p>`);
        }
      }
      currentParagraph = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const nextLine = lines[i + 1] ?? '';

      // Skip page numbers and purely blank lines between sections
      if (isPageNumber(trimmed)) continue;

      if (trimmed === '') {
        flushParagraph();
        continue;
      }

      if (isLikelyHeading(trimmed, nextLine)) {
        flushParagraph();
        // Pick heading level: h2 for chapter-level, h3 for sub-sections
        const level = /^(chapter|part|appendix|\d+\.\s)/i.test(trimmed) ? 2 : 3;
        htmlParts.push(`<h${level}>${trimmed}</h${level}>`);
        continue;
      }

      // Merge line-wrapped paragraphs: if previous line didn't end with sentence terminator
      // and current line starts with lowercase → continuation
      const prevInParagraph = currentParagraph[currentParagraph.length - 1] ?? '';
      const isContinuation =
        currentParagraph.length > 0 &&
        !prevInParagraph.match(/[.!?:]\s*$/) &&
        /^[a-z("]/.test(trimmed);

      if (isContinuation || currentParagraph.length === 0) {
        currentParagraph.push(trimmed);
      } else {
        // Line starts a new sentence — still same paragraph unless double newline already flushed
        currentParagraph.push(trimmed);
      }
    }

    flushParagraph();
    return htmlParts.join('\n');
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
