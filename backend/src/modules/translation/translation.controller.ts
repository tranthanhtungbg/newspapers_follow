import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TranslationService } from './translation.service';
import { IsString, IsOptional, MaxLength } from 'class-validator';

class ContextualTranslationDto {
  @IsString()
  @MaxLength(500)
  text: string;

  @IsString()
  sourceLang: string;

  @IsString()
  targetLang: string;

  @IsString()
  @MaxLength(1000)
  contextParagraph: string;

  @IsOptional()
  @IsString()
  articleId?: string;
}

@Controller('translation')
export class TranslationController {
  constructor(private readonly translation: TranslationService) {}

  @Post('contextual')
  @Throttle({ medium: { limit: 60, ttl: 60000 } })
  contextual(@Body() dto: ContextualTranslationDto) {
    return this.translation.translateContextual(dto);
  }
}
