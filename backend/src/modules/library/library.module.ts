// Library Module — Saved Resources
import { Module, Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Injectable, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Injectable()
class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, params: { page?: number; limit?: number; type?: string; isRead?: boolean }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(params.type && { type: params.type as never }),
      ...(params.isRead !== undefined && { isRead: params.isRead }),
    };

    const [items, total] = await Promise.all([
      this.prisma.savedResource.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
      this.prisma.savedResource.count({ where }),
    ]);

    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(userId: string, data: any) {
    if (data.url) {
      const existing = await this.prisma.savedResource.findFirst({
        where: { userId, url: data.url }
      });
      if (existing) {
        // If it exists, just bump the updatedAt timestamp
        return this.prisma.savedResource.update({
          where: { id: existing.id },
          data: { updatedAt: new Date(), title: data.title || existing.title }
        });
      }
    }
    return this.prisma.savedResource.create({ data: { ...data, userId } as never });
  }

  async update(userId: string, id: string, data: object) {
    return this.prisma.savedResource.update({ where: { id }, data: data as never });
  }

  async delete(userId: string, id: string) {
    await this.prisma.savedResource.delete({ where: { id } });
    return { deleted: true };
  }
}

@Controller('library')
@UseGuards(AuthGuard('jwt'))
class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: Record<string, string>) {
    return this.library.list(user.id, query as never);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: object) {
    return this.library.create(user.id, body);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body() body: object) {
    return this.library.update(user.id, id, body);
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.library.delete(user.id, id);
  }
}

@Module({
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
