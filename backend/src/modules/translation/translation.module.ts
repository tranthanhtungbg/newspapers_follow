import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { AiService } from './ai.service';

@Module({
  controllers: [TranslationController],
  providers: [TranslationService, AiService],
  exports: [TranslationService, AiService],
})
export class TranslationModule {}
