import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';

import { winstonConfig } from './common/logger/winston.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

import { AuthModule } from './modules/auth/auth.module';
import { ReaderModule } from './modules/reader/reader.module';
import { TranslationModule } from './modules/translation/translation.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { TtsModule } from './modules/tts/tts.module';
import { LibraryModule } from './modules/library/library.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ── Logger ──────────────────────────────────────────────
    WinstonModule.forRoot(winstonConfig),

    // ── Rate Limiting ────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 60 },
      { name: 'long', ttl: 3600000, limit: 200 },
    ]),

    // ── Scheduled Tasks ──────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Queue (BullMQ via Redis) ──────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // ── Core Infrastructure ───────────────────────────────────
    PrismaModule,
    RedisModule,

    // ── Feature Modules ───────────────────────────────────────
    AuthModule,
    UserModule,
    ReaderModule,
    TranslationModule,
    VocabularyModule,
    FlashcardModule,
    TtsModule,
    LibraryModule,
    NotificationModule,
    AdminModule,
  ],
})
export class AppModule {}
