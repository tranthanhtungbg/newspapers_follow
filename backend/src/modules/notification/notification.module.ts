// Notification Module — BullMQ + Nodemailer (stub, expand later)
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'notifications' }),
  ],
})
export class NotificationModule {}
