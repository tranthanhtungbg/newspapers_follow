// Admin Module — User management, backups, logs
import { Module, Controller, Get, Post, Query, UseGuards, Injectable } from '@nestjs/common';
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

const execAsync = promisify(exec);

@Injectable()
class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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

  @Post('backup')
  triggerBackup(@CurrentUser() user: User) {
    return this.admin.triggerBackup(user);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
