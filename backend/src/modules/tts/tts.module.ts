// TTS Module — Google Cloud TTS / ElevenLabs with S3 cache
import { Module, Controller, Post, Body, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createHash } from 'crypto';

@Injectable()
class TtsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generate(text: string, lang: string, voice = 'default') {
    const textHash = createHash('sha256').update(`${text}:${lang}:${voice}`).digest('hex');

    // Check DB cache
    const cached = await this.prisma.ttsCache.findUnique({ where: { textHash } });
    if (cached) return { audioUrl: cached.audioUrl, duration: cached.durationMs, cached: true };

    // TODO: Integrate Google Cloud TTS or ElevenLabs
    // Placeholder response until TTS provider configured
    const audioUrl = `${this.config.get('S3_PUBLIC_URL')}/tts/${textHash}.mp3`;

    await this.prisma.ttsCache.create({
      data: { textHash, text, lang, voice, audioUrl, provider: 'google' },
    });

    return { audioUrl, duration: null, cached: false };
  }
}

@Controller('tts')
class TtsController {
  constructor(private readonly tts: TtsService) {}

  @Post('generate')
  generate(@Body() body: { text: string; lang: string; voice?: string }) {
    return this.tts.generate(body.text, body.lang, body.voice);
  }
}

@Module({
  controllers: [TtsController],
  providers: [TtsService],
})
export class TtsModule {}
