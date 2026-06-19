import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GrammarService {
  constructor(private prisma: PrismaService) {}

  // Get full roadmap (Topics grouped by Level)
  async getRoadmap(userId: string) {
    const topics = await this.prisma.grammarTopic.findMany({
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ],
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            progress: {
              where: { userId }
            }
          }
        }
      }
    });

    // Map to nice structure
    return topics.map((topic: any) => ({
      ...topic,
      lessons: topic.lessons.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        isCompleted: lesson.progress[0]?.isCompleted || false,
        score: lesson.progress[0]?.score || null
      }))
    }));
  }

  // Get lesson details
  async getLessonDetail(userId: string, lessonId: string) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id: lessonId },
      include: {
        topic: true,
        progress: {
          where: { userId }
        }
      }
    });

    if (!lesson) {
      throw new NotFoundException('Grammar lesson not found');
    }

    return {
      ...lesson,
      progress: lesson.progress[0] || null
    };
  }

  // Mark lesson as completed
  async markLessonCompleted(userId: string, lessonId: string, score: number) {
    const lesson = await this.prisma.grammarLesson.findUnique({
      where: { id: lessonId }
    });

    if (!lesson) {
      throw new NotFoundException('Grammar lesson not found');
    }

    return this.prisma.userGrammarProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        isCompleted: true,
        score,
        lastStudied: new Date()
      },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        score,
        lastStudied: new Date()
      }
    });
  }

  // ─── ADMIN CRUD ─────────────────────────────────────────────

  async adminGetTopics() {
    return this.prisma.grammarTopic.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }],
      include: { _count: { select: { lessons: true } } }
    });
  }

  async adminGetTopic(id: string) {
    return this.prisma.grammarTopic.findUniqueOrThrow({ where: { id } });
  }

  async adminCreateTopic(data: { title: string; description?: string; level: string; order: number }) {
    return this.prisma.grammarTopic.create({ data: data as any });
  }

  async adminUpdateTopic(id: string, data: any) {
    return this.prisma.grammarTopic.update({ where: { id }, data });
  }

  async adminDeleteTopic(id: string) {
    await this.prisma.grammarLesson.deleteMany({ where: { topicId: id } });
    return this.prisma.grammarTopic.delete({ where: { id } });
  }

  async adminGetLessons(topicId: string) {
    return this.prisma.grammarLesson.findMany({
      where: { topicId },
      orderBy: { order: 'asc' }
    });
  }

  async adminCreateLesson(topicId: string, data: any) {
    return this.prisma.grammarLesson.create({ data: { ...data, topicId } });
  }

  async adminUpdateLesson(id: string, data: any) {
    return this.prisma.grammarLesson.update({ where: { id }, data });
  }

  async adminDeleteLesson(id: string) {
    await this.prisma.userGrammarProgress.deleteMany({ where: { lessonId: id } });
    return this.prisma.grammarLesson.delete({ where: { id } });
  }
}

