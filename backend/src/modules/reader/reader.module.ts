import { Module } from '@nestjs/common';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { ScraperService } from './scraper.service';
import { YoutubeService } from './youtube.service';
import { AiService } from '../translation/ai.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ReaderController],
  providers: [ReaderService, ScraperService, YoutubeService, AiService],
  exports: [ReaderService, YoutubeService],
})
export class ReaderModule {}
