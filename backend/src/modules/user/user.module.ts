// Stub modules — to be expanded per spec
import { Module, Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';

@Injectable()
class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async updateSettings(userId: string, data: { appearanceSettings?: object; sourceLang?: string; targetLang?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async updateReminder(userId: string, data: { reminderTime?: string; reminderTz?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async getStreak(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { streakCount: user.streakCount };
  }
}

@Controller('user')
@UseGuards(AuthGuard('jwt'))
class UserController {
  constructor(private readonly userSvc: UserService) {}

  @Patch('settings')
  updateSettings(@CurrentUser() user: User, @Body() body: object) {
    return this.userSvc.updateSettings(user.id, body);
  }

  @Patch('reminder-settings')
  updateReminder(@CurrentUser() user: User, @Body() body: { reminderTime?: string; reminderTz?: string }) {
    return this.userSvc.updateReminder(user.id, body);
  }

  @Get('streak')
  getStreak(@CurrentUser() user: User) {
    return this.userSvc.getStreak(user.id);
  }
}

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
