import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { AiService } from './ai.service';
import { createHash } from 'crypto';
import type { TranslationResult } from './translation.types';

@Injectable()
export class TranslationService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly ai: AiService,
  ) {}

  async translateContextual(dto: {
    text: string;
    sourceLang: string;
    targetLang: string;
    contextParagraph: string;
    articleId?: string;
  }): Promise<TranslationResult> {
    const cacheKey = `trans:${createHash('md5')
      .update(`${dto.text}:${dto.sourceLang}:${dto.targetLang}:${dto.contextParagraph.slice(0, 100)}`)
      .digest('hex')}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const result = await this.ai.translate(
      dto.text,
      dto.sourceLang,
      dto.targetLang,
      dto.contextParagraph,
    );

    // Cache translation for 30 days (2592000 seconds) to drastically save AI tokens
    await this.redis.setex(cacheKey, 2592000, JSON.stringify(result));
    return result;
  }
}
