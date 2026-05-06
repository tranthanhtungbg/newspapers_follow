import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /** Soft delete helper — sets deletedAt field if model has it */
  async softDelete(model: string, where: Record<string, unknown>) {
    return (this as unknown as Record<string, { update: Function }>)[model].update({
      where,
      data: { deletedAt: new Date() },
    });
  }
}
