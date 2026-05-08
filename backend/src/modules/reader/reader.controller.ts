import {
  Controller, Post, Body, Req, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReaderService } from './reader.service';
import { YoutubeService } from './youtube.service';
import { IsUrl, IsString, IsIn, IsOptional } from 'class-validator';

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

class YoutubeDto {
  @IsUrl({}, { message: 'Must be a valid YouTube URL' })
  url: string;

  @IsOptional()
  @IsString()
  targetLang?: string;
}

@Controller('reader')
export class ReaderController {
  constructor(
    private readonly reader: ReaderService,
    private readonly youtube: YoutubeService,
    private readonly jwt: JwtService,
  ) {}

  // POST /reader/youtube — get video info & translated subtitles
  @Post('youtube')
  @Throttle({ medium: { limit: 10, ttl: 3600000 } })
  async getYoutubeSubtitles(@Body() dto: YoutubeDto) {
    const result = await this.youtube.getSubtitlesInfo(dto.url, dto.targetLang || 'vi');
    return { success: true, data: result };
  }

  @Post('youtube/translate-batch')
  @Throttle({ medium: { limit: 100, ttl: 3600000 } })
  async translateYoutubeBatch(
    @Body('texts') texts: string[],
    @Body('targetLang') targetLang?: string,
  ) {
    if (!texts || !texts.length) return { success: true, data: [] };
    const translations = await this.youtube.translateBatch(texts, targetLang || 'vi');
    return { success: true, data: translations };
  }

  @Post('youtube/save')
  async saveYoutubeSubtitles(
    @Body('videoId') videoId: string,
    @Body('title') title: string,
    @Body('targetLang') targetLang: string,
    @Body('subtitles') subtitles: any[],
  ) {
    if (!videoId || !subtitles) {
      throw new BadRequestException('videoId and subtitles are required');
    }
    await this.youtube.saveToCache(videoId, title, targetLang || 'vi', subtitles);
    return { success: true, message: 'Saved to cache' };
  }

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

  // POST /reader/upload-pdf — upload & parse PDF
  @Post('upload-pdf')
  @Throttle({ medium: { limit: 10, ttl: 3600000 } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }))
  async uploadPdf(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No PDF file uploaded');
    if (!file.mimetype.includes('pdf') && !file.originalname.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are allowed');
    }

    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        user = this.jwt.verify(token);
      } catch {
        // invalid token, treat as guest
      }
    }

    return this.reader.parsePdf(file.buffer, file.originalname, user);
  }
}
