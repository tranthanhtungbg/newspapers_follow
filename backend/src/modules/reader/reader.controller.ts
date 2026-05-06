import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ReaderService } from './reader.service';
import { IsUrl, IsString, IsIn } from 'class-validator';

class FetchArticleDto {
  @IsUrl({}, { message: 'Must be a valid URL' })
  url: string;
}

class SummarizeDto {
  @IsString()
  articleId: string;

  @IsString()
  targetLang: string;

  @IsIn(['brief', 'medium', 'detailed'])
  level: 'brief' | 'medium' | 'detailed';
}

@Controller('reader')
export class ReaderController {
  constructor(
    private readonly reader: ReaderService,
    private readonly jwt: JwtService,
  ) {}

  // POST /reader/fetch — public (rate limited)
  @Post('fetch')
  @Throttle({ medium: { limit: 20, ttl: 3600000 } })
  async fetchArticle(@Body() dto: FetchArticleDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        user = this.jwt.verify(token);
      } catch (e) {
        // invalid token, treat as guest
      }
    }
    
    return this.reader.fetchArticle(dto.url, ip, user);
  }

  // POST /reader/summarize — public
  @Post('summarize')
  summarize(@Body() dto: SummarizeDto) {
    return this.reader.summarize(dto.articleId, dto.targetLang, dto.level);
  }
}
