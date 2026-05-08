import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { YoutubeTranscript } from 'youtube-transcript';
import { AiService } from '../translation/ai.service';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface SubtitleLine {
  start: number;     // seconds
  duration: number;  // seconds
  text: string;
  translation: string;
}

export interface YoutubeVideoInfo {
  videoId: string;
  title: string;
  subtitles: SubtitleLine[];
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly ai: AiService,
    private readonly prisma: PrismaService,
  ) {}

  /** Extract YouTube video ID from any YouTube URL format */
  private extractVideoId(url: string): string {
    const patterns = [
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return m[1];
    }
    throw new BadRequestException('Invalid YouTube URL');
  }

  /** Fetch transcript immediately (from Cache or RAW Youtube), without translating. Fast! */
  async getSubtitlesInfo(url: string, targetLang = 'vi'): Promise<YoutubeVideoInfo> {
    const videoId = this.extractVideoId(url);

    // 1. Check DB Cache
    const cached = await this.prisma.youtubeTranscript.findUnique({
      where: { videoId_targetLang: { videoId, targetLang } }
    });
    if (cached) {
      this.logger.log(`Found cached subtitles for video ${videoId} in ${targetLang}`);
      return { videoId, title: cached.title, subtitles: cached.subtitles as any };
    }

    // 2. Not cached -> Fetch RAW English transcript
    let rawItems: { text: string; duration: number; offset: number }[] = [];
    try {
      // Try fetching the default transcript first (usually human-made and perfectly synced)
      rawItems = await YoutubeTranscript.fetchTranscript(videoId);
    } catch {
      try {
        // Fallback to explicit 'en' (might be auto-generated or not default)
        rawItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      } catch (e) {
        throw new BadRequestException('Could not fetch subtitles. Video may not have captions.');
      }
    }

    if (!rawItems.length) {
      throw new BadRequestException('No subtitles found for this video.');
    }

    const clean = (t: string) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();

    const lines: SubtitleLine[] = rawItems.map((item) => ({
      start: item.offset / 1000,
      duration: item.duration / 1000,
      text: clean(item.text),
      translation: '', // Empty means frontend should batch translate it
    }));

    return { videoId, title: `YouTube Video (${videoId})`, subtitles: lines };
  }

  /** Translate a small batch of subtitle texts (used for progressive streaming) */
  async translateBatch(texts: string[], targetLang: string): Promise<{en: string, vi: string}[]> {
    if (!texts.length) return [];
    
    const numbered = texts.map((text, idx) => `${idx + 1}. ${text}`).join('\n');
    try {
      const prompt = `You are an expert language assistant.
I will give you a numbered list of auto-generated English YouTube subtitles. They may contain speech-to-text errors and lack punctuation.
For each line:
1. Fix any spelling/grammar/punctuation mistakes in the English text to make it natural and readable.
2. Translate the corrected English text to ${targetLang}.

Return ONLY a JSON array of objects, keeping the exact same order and line count. Do NOT output any markdown code blocks.
Example format:
[
  {"en": "First corrected line.", "vi": "Dòng đầu tiên được dịch."},
  {"en": "Second corrected line.", "vi": "Dòng thứ hai được dịch."}
]

Subtitles:
${numbered}`;

      const result = await this.ai['client'].chat.completions.create({
        model: this.ai['model'],
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const raw = result.choices[0]?.message?.content ?? '[]';
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      const fixed: {en: string, vi: string}[] = JSON.parse(cleaned);
      
      // Ensure lengths match
      if (fixed.length === texts.length) return fixed;
      
      // Fallback: If AI returned wrong array size, pad with empty strings
      return texts.map((text, i) => fixed[i] || { en: text, vi: '' });
    } catch (err) {
      this.logger.error(`Batch translation failed: ${err.message}`);
      return texts.map(text => ({ en: text, vi: '' })); // Return fallback strings on failure
    }
  }

  /** Save the completed subtitles to Cache DB */
  async saveToCache(videoId: string, title: string, targetLang: string, subtitles: SubtitleLine[]) {
    await this.prisma.youtubeTranscript.upsert({
      where: { videoId_targetLang: { videoId, targetLang } },
      create: { videoId, targetLang, title, subtitles: subtitles as any },
      update: { title, subtitles: subtitles as any },
    });
  }
}
