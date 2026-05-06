import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * SM-2 Algorithm Implementation
 * score 0-5: 0=blackout, 3=correct with difficulty, 5=perfect
 */
function sm2(
  easeFactor: number,
  intervalDays: number,
  score: number,
): { newEaseFactor: number; newInterval: number; nextDate: Date } {
  let newEF = easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval: number;
  if (score < 3) {
    newInterval = 1; // repeat today
  } else if (intervalDays <= 1) {
    newInterval = 1;
  } else if (intervalDays === 2) {
    newInterval = 6;
  } else {
    newInterval = Math.round(intervalDays * newEF);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newInterval);

  return { newEaseFactor: newEF, newInterval, nextDate };
}

@Injectable()
export class FlashcardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDueToday(userId: string, cramMode: boolean = false, dateStr?: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let startOfDay: Date | undefined;
    let endOfDay: Date | undefined;

    if (dateStr) {
      startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
    }

    if (cramMode || dateStr) {
      // Auto-initialize sessions for vocab items that don't have one
      const missingWhere: any = { userId, isMastered: false, flashcardSession: null };
      if (dateStr) {
        missingWhere.createdAt = { gte: startOfDay, lte: endOfDay };
      }

      const missingSessions = await this.prisma.vocabularyItem.findMany({
        where: missingWhere,
        take: 50,
      });

      if (missingSessions.length > 0) {
        await this.prisma.flashcardSession.createMany({
          data: missingSessions.map(v => ({
            userId,
            vocabId: v.id,
            score: 0,
            easeFactor: 2.5,
            intervalDays: 1,
            nextReviewDate: today,
          })),
        });
      }
    }

    const whereClause: any = { userId, vocab: { isMastered: false } };

    if (dateStr) {
      whereClause.vocab.createdAt = { gte: startOfDay, lte: endOfDay };
    } else if (!cramMode) {
      whereClause.nextReviewDate = { lte: today };
    }

    return this.prisma.flashcardSession.findMany({
      where: whereClause,
      include: { vocab: true },
      orderBy: { easeFactor: 'asc' },
      take: 50,
    });
  }

  async review(
    userId: string,
    vocabId: string,
    score: number,
    durationMs: number,
  ) {
    const existing = await this.prisma.flashcardSession.findUnique({
      where: { vocabId },
    });

    const easeFactor = existing?.easeFactor ?? 2.5;
    const intervalDays = existing?.intervalDays ?? 1;
    const { newEaseFactor, newInterval, nextDate } = sm2(easeFactor, intervalDays, score);

    const historyEntry = { date: new Date().toISOString(), score, durationMs };
    const history = [...((existing?.reviewHistory as unknown[]) ?? []), historyEntry];

    const session = await this.prisma.flashcardSession.upsert({
      where: { vocabId },
      create: {
        userId,
        vocabId,
        score,
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        nextReviewDate: nextDate,
        reviewHistory: history as never,
      },
      update: {
        score,
        easeFactor: newEaseFactor,
        intervalDays: newInterval,
        nextReviewDate: nextDate,
        reviewHistory: history as never,
      },
    });

    // Auto-master if interval > 21 days
    if (newInterval >= 21) {
      await this.prisma.vocabularyItem.update({
        where: { id: vocabId },
        data: { isMastered: true, reviewCount: { increment: 1 } },
      });
    } else {
      await this.prisma.vocabularyItem.update({
        where: { id: vocabId },
        data: { reviewCount: { increment: 1 }, lastReviewedAt: new Date() },
      });
    }

    return session;
  }

  async getStats(userId: string) {
    const [totalDue, masteredCount, todayReviews] = await Promise.all([
      this.prisma.flashcardSession.count({
        where: { userId, nextReviewDate: { lte: new Date() } },
      }),
      this.prisma.vocabularyItem.count({ where: { userId, isMastered: true } }),
      this.prisma.vocabularyItem.count({
        where: {
          userId,
          lastReviewedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return { totalDue, masteredCount, totalReviewed: todayReviews };
  }
}
