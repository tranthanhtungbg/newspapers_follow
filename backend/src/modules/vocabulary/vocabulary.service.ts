import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ───────────────────────────────────────────────────

  async create(userId: string, dto: Record<string, unknown>) {
    const { user: _user, ...rest } = dto as Record<string, unknown>;
    return this.prisma.vocabularyItem.create({
      data: {
        ...(rest as Prisma.VocabularyItemUncheckedCreateInput),
        userId,
        flashcardSession: {
          create: {
            userId,
            score: 0,
            easeFactor: 2.5,
            intervalDays: 1,
            nextReviewDate: new Date(),
          },
        },
      },
    });
  }

  // ── List (paginated + filterable) ─────────────────────────────

  async list(userId: string, params: {
    page?: number;
    limit?: number;
    search?: string;
    isMastered?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    tags?: string[];
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.VocabularyItemWhereInput = {
      userId,
      ...(params.search && {
        OR: [
          { word: { contains: params.search, mode: 'insensitive' } },
          { translation: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.isMastered !== undefined && { isMastered: params.isMastered }),
      ...(params.tags?.length && { tags: { hasSome: params.tags } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.vocabularyItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [params.sortBy ?? 'createdAt']: params.sortOrder ?? 'desc' },
      }),
      this.prisma.vocabularyItem.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Update ───────────────────────────────────────────────────

  async update(userId: string, id: string, data: Partial<Prisma.VocabularyItemUpdateInput>) {
    await this.assertOwner(userId, id);
    return this.prisma.vocabularyItem.update({ where: { id }, data });
  }

  // ── Delete ───────────────────────────────────────────────────

  async delete(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.vocabularyItem.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Bulk Delete ───────────────────────────────────────────────

  async bulkDelete(userId: string, ids: string[]) {
    await this.prisma.vocabularyItem.deleteMany({ where: { userId, id: { in: ids } } });
    return { deleted: ids.length };
  }

  // ── Pin / Unpin ───────────────────────────────────────────────

  async pin(userId: string, vocabId: string, categoryId?: string) {
    try {
      return await this.prisma.pinnedVocabulary.upsert({
        where: { userId_vocabId: { userId, vocabId } },
        create: { userId, vocabId, categoryId },
        update: { categoryId },
      });
    } catch (error) {
      require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + String(error) + '\n');
      throw error;
    }
  }

  async unpin(userId: string, vocabId: string) {
    await this.prisma.pinnedVocabulary.delete({
      where: { userId_vocabId: { userId, vocabId } },
    });
    return { unpinned: true };
  }

  async getPins(userId: string) {
    return this.prisma.pinnedVocabulary.findMany({
      where: { userId },
      include: { vocab: true, category: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  // ── Categories ────────────────────────────────────────────────

  async getCategories(userId: string) {
    return this.prisma.pinCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(userId: string, name: string, color?: string) {
    return this.prisma.pinCategory.create({
      data: { userId, name, color: color || 'amber' },
    });
  }

  async updateCategory(userId: string, id: string, name?: string, color?: string) {
    const cat = await this.prisma.pinCategory.findUnique({ where: { id } });
    if (!cat || cat.userId !== userId) throw new NotFoundException('Category not found');
    
    const data: any = {};
    if (name) data.name = name;
    if (color) data.color = color;
    
    return this.prisma.pinCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(userId: string, id: string) {
    const cat = await this.prisma.pinCategory.findUnique({ where: { id } });
    if (!cat || cat.userId !== userId) throw new NotFoundException('Category not found');
    await this.prisma.pinCategory.delete({ where: { id } });
    return { deleted: true };
  }

  // ── Helpers ───────────────────────────────────────────────────

  private async assertOwner(userId: string, id: string) {
    const item = await this.prisma.vocabularyItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Vocabulary item not found');
    if (item.userId !== userId) throw new ForbiddenException('Access denied');
    return item;
  }
}
