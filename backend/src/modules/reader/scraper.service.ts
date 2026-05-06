import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import axios from 'axios';

interface ScrapeResult {
  title: string;
  content: string;
  lang: string;
  metadata: {
    author?: string;
    description?: string;
    image?: string;
    publishedAt?: string;
    siteName?: string;
  };
}

const USER_AGENT =
  'Mozilla/5.0 (compatible; LingoReader/1.0; +https://lingoreader.io)';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrape(url: string): Promise<ScrapeResult> {
    try {
      return await this.scrapeWithCheerio(url);
    } catch (err) {
      this.logger.error(`Cheerio scrape failed for ${url}`, err);
      throw err;
    }
  }

  private async scrapeWithCheerio(url: string): Promise<ScrapeResult> {
    const res = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      timeout: 15000,
      maxRedirects: 5,
    });

    const html = res.data as string;
    
    // Use JSDOM and Readability for robust content extraction
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    // Fallback to basic cheerio metadata if Readability fails
    const $ = cheerio.load(html);
    const title = article?.title || $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = article?.excerpt || $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content');
    const author = article?.byline || $('meta[name="author"]').attr('content') || $('[rel="author"]').first().text();
    const siteName = article?.siteName || $('meta[property="og:site_name"]').attr('content');
    const lang = $('html').attr('lang')?.slice(0, 2) || $('meta[http-equiv="Content-Language"]').attr('content') || 'en';

    let content = article?.content || '';

    // If we have content from Readability, we still want to clean it up slightly to match our allowed tags
    if (content) {
      const $content = cheerio.load(content);
      const allowed = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'a', 'img']);
      $content('body').find('*').each((_, el) => {
        const tag = (el as { tagName?: string }).tagName?.toLowerCase();
        // Remove class names and IDs to keep it clean, except we want to keep structure
        if (tag) {
           $(el).removeAttr('class');
           $(el).removeAttr('id');
        }
        if (tag && !allowed.has(tag) && tag !== 'body' && tag !== 'html' && tag !== 'head') {
          // Instead of replaceWith, just let the frontend Handle it or unwrap it
          // Readability already stripped dangerous tags. We will just unwrap unknown tags.
          $(el).replaceWith($(el).html() ?? '');
        }
      });
      content = $content('body').html()?.trim() ?? content;
    } else {
      // Very basic fallback if Readability completely fails
      content = $('article').first().html() || $('body').html() || '';
    }

    return {
      title: title.trim(),
      content,
      lang: lang.trim(),
      metadata: { author, description, image, siteName },
    };
  }
}
