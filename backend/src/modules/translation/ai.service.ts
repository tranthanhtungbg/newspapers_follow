import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { TranslationResult } from './translation.types';
import type { ArticleSummary } from '../reader/reader.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    // Trigger backend reload to load new env vars
    const model = config.get('OPENAI_MODEL', 'gpt-4o');
    const baseURL = model.startsWith('gemini') 
      ? 'https://generativelanguage.googleapis.com/v1beta/openai/' 
      : undefined;

    this.client = new OpenAI({ 
      apiKey: config.get('OPENAI_API_KEY'),
      baseURL
    });
    this.model = model;
  }

  // ── Contextual Translation ──────────────────────────────────

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
    contextParagraph: string,
  ): Promise<TranslationResult> {
    const prompt = `Translate the following ${sourceLang} text to ${targetLang}.

Context paragraph: """${contextParagraph.slice(0, 500)}"""
Target text: """${text}"""

Respond ONLY in JSON (no markdown, no preamble):
{
  "translation": "string",
  "partOfSpeech": "noun|verb|adj|adv|phrase|other",
  "ipa": "/pronunciation/",
  "contextMeaning": "meaning specific to this context",
  "alternativeMeanings": ["meaning2", "meaning3"],
  "examples": [{ "en": "example in English", "${targetLang}": "translation" }],
  "collocations": ["common phrase 1", "common phrase 2"],
  "register": "formal|informal|neutral|technical"
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned) as TranslationResult;
  }

  // ── Article Summarization ────────────────────────────────────

  async summarize(content: string, targetLang: string): Promise<ArticleSummary> {
    const truncated = content.replace(/<[^>]*>/g, '').slice(0, 8000);

    const prompt = `Summarize the following article in ${targetLang}.
Article: """${truncated}"""

Return ONLY JSON:
{
  "brief": "3-sentence summary",
  "medium": "1-paragraph summary (150-200 words)",
  "detailed": "full structured summary with sections",
  "keyPoints": ["point1", "point2", "point3"],
  "entities": ["person/place/org names"],
  "tags": ["topic", "category"],
  "sentiment": "positive|negative|neutral",
  "readingLevel": "beginner|intermediate|advanced"
}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned) as ArticleSummary;
  }
}
