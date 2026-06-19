// Admin Module — User management, backups, logs
import { Module, Controller, Get, Post, Query, Param, UseGuards, Injectable, Delete, Patch, Body, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import type { User } from '@prisma/client';
import { ReaderModule } from '../reader/reader.module';
import { ReaderService } from '../reader/reader.service';
import * as bcrypt from 'bcrypt';

const execAsync = promisify(exec);

@Injectable()
class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readerService: ReaderService,
  ) {}

  async listArticles(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { url: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.cachedArticle.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { cachedAt: 'desc' },
      }),
      this.prisma.cachedArticle.count({ where: where as any }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async deleteArticle(id: string) {
    await this.prisma.cachedArticle.delete({ where: { id } });
    return { success: true };
  }

  async preFetchArticle(url: string, user: User) {
    return this.readerService.fetchArticle(url, 'admin-prefetch', user);
  }

  async listYoutubeTranscripts(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { videoId: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.youtubeTranscript.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.youtubeTranscript.count({ where: where as any }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async deleteYoutubeTranscript(videoId: string, targetLang: string) {
    await this.prisma.youtubeTranscript.delete({
      where: {
        videoId_targetLang: { videoId, targetLang },
      },
    });
    return { success: true };
  }

  async updateYoutubeTranscript(videoId: string, targetLang: string, title: string, subtitles: any) {
    return this.prisma.youtubeTranscript.update({
      where: {
        videoId_targetLang: { videoId, targetLang },
      },
      data: {
        title,
        subtitles,
      },
    });
  }

  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = params.search
      ? { OR: [{ email: { contains: params.search } }, { name: { contains: params.search } }] }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUserProgress(userId: string) {
    const [user, grammarProgress, vocabularyCount] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.userGrammarProgress.findMany({
        where: { userId },
        include: { lesson: { select: { id: true, title: true, order: true } } },
        orderBy: { lastStudied: 'desc' }
      }),
      this.prisma.vocabularyItem.count({ where: { userId } })
    ]);
    return { user, grammarProgress, vocabularyCount };
  }

  async createUser(data: { name: string; email: string; password?: string; role: any }) {
    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 12);
    }
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      },
    });
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async changePassword(userId: string, data: { currentPassword?: string; newPassword?: string }) {
    if (!data.currentPassword || !data.newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!user.passwordHash) {
      throw new BadRequestException('Local authentication not configured for this user');
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { success: true };
  }

  async resetUserPassword(id: string, password?: string) {
    if (!password) {
      throw new BadRequestException('Password is required');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
    return { success: true };
  }

  async listAllVocabulary(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = params.search
      ? {
          OR: [
            { word: { contains: params.search, mode: 'insensitive' } },
            { translation: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.vocabularyItem.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.vocabularyItem.count({ where: where as any }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createVocabulary(data: {
    userId: string;
    word: string;
    translation: string;
    ipa?: string;
    partOfSpeech?: string;
    contextSentence?: string;
    sourceLang?: string;
    targetLang?: string;
  }) {
    return this.prisma.vocabularyItem.create({
      data: {
        userId: data.userId,
        word: data.word,
        translation: data.translation,
        ipa: data.ipa || null,
        partOfSpeech: data.partOfSpeech || null,
        contextSentence: data.contextSentence || null,
        sourceLang: data.sourceLang || 'en',
        targetLang: data.targetLang || 'vi',
      },
    });
  }

  async deleteVocabulary(id: string) {
    await this.prisma.vocabularyItem.delete({ where: { id } });
    return { success: true };
  }

  async triggerBackup(user: User) {
    const backupDir = path.join(process.cwd(), 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `lingoreader_backup_${timestamp}.sql`;
    const storagePath = path.join(backupDir, filename);

    const backupRecord = await this.prisma.systemBackup.create({
      data: {
        filename,
        storagePath,
        status: 'running',
        triggeredBy: user.id,
      },
    });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      await this.prisma.systemBackup.update({
        where: { id: backupRecord.id },
        data: { status: 'failed', errorMessage: 'DATABASE_URL not found' },
      });
      throw new Error('DATABASE_URL not found');
    }

    // Run pg_dump in background so we don't block the request
    (async () => {
      try {
        // -C includes CREATE DATABASE, but we usually just want schema and data, so default is fine
        // -F p means plain text (sql script)
        const cmd = `pg_dump --dbname="${dbUrl}" -F p -f "${storagePath}"`;
        await execAsync(cmd);
        
        const stats = fs.statSync(storagePath);
        await this.prisma.systemBackup.update({
          where: { id: backupRecord.id },
          data: { 
            status: 'success', 
            sizeBytes: stats.size,
            completedAt: new Date()
          },
        });
      } catch (error: any) {
        await this.prisma.systemBackup.update({
          where: { id: backupRecord.id },
          data: { status: 'failed', errorMessage: error.message || 'Unknown error during pg_dump' },
        });
      }
    })();

    return backupRecord;
  }
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(@Query() query: Record<string, string>) {
    return this.admin.listUsers(query as never);
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.admin.createUser(body);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.admin.deleteUser(id);
  }

  @Patch('users/:id/reset-password')
  resetUserPassword(@Param('id') id: string, @Body('password') password?: string) {
    return this.admin.resetUserPassword(id, password);
  }

  @Post('change-password')
  changePassword(@CurrentUser() user: User, @Body() body: any) {
    return this.admin.changePassword(user.id, body);
  }

  @Get('users/:id/progress')
  getUserProgress(@Param('id') id: string) {
    return this.admin.getUserProgress(id);
  }

  @Get('vocabulary')
  listAllVocabulary(@Query() query: Record<string, string>) {
    return this.admin.listAllVocabulary(query as never);
  }

  @Post('vocabulary')
  createVocabulary(@Body() body: any) {
    return this.admin.createVocabulary(body);
  }

  @Delete('vocabulary/:id')
  deleteVocabulary(@Param('id') id: string) {
    return this.admin.deleteVocabulary(id);
  }

  @Post('backup')
  triggerBackup(@CurrentUser() user: User) {
    return this.admin.triggerBackup(user);
  }

  @Get('articles')
  listArticles(@Query() query: Record<string, string>) {
    return this.admin.listArticles(query as never);
  }

  @Delete('articles/:id')
  deleteArticle(@Param('id') id: string) {
    return this.admin.deleteArticle(id);
  }

  @Post('articles/pre-fetch')
  preFetchArticle(@Body('url') url: string, @CurrentUser() user: User) {
    return this.admin.preFetchArticle(url, user);
  }

  @Get('youtube')
  listYoutubeTranscripts(@Query() query: Record<string, string>) {
    return this.admin.listYoutubeTranscripts(query as never);
  }

  @Delete('youtube/:videoId/:targetLang')
  deleteYoutubeTranscript(@Param('videoId') videoId: string, @Param('targetLang') targetLang: string) {
    return this.admin.deleteYoutubeTranscript(videoId, targetLang);
  }

  @Patch('youtube/:videoId/:targetLang')
  updateYoutubeTranscript(
    @Param('videoId') videoId: string,
    @Param('targetLang') targetLang: string,
    @Body('title') title: string,
    @Body('subtitles') subtitles: any,
  ) {
    return this.admin.updateYoutubeTranscript(videoId, targetLang, title, subtitles);
  }
}

@Module({
  imports: [ReaderModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
