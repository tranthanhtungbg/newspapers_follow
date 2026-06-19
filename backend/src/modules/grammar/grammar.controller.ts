import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('grammar')
@UseGuards(AuthGuard('jwt'))
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  // ─── User routes ─────────────────────────────────────────────
  @Get('roadmap')
  getRoadmap(@CurrentUser() user: any) {
    return this.grammarService.getRoadmap(user.id);
  }

  @Get('lessons/:id')
  getLessonDetail(@CurrentUser() user: any, @Param('id') lessonId: string) {
    return this.grammarService.getLessonDetail(user.id, lessonId);
  }

  @Post('lessons/:id/complete')
  markCompleted(@CurrentUser() user: any, @Param('id') lessonId: string, @Body('score') score: number) {
    return this.grammarService.markLessonCompleted(user.id, lessonId, score);
  }

  // ─── Admin routes ─────────────────────────────────────────────
  @Get('admin/topics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminGetTopics() { return this.grammarService.adminGetTopics(); }

  @Get('admin/topics/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminGetTopic(@Param('id') id: string) { return this.grammarService.adminGetTopic(id); }

  @Post('admin/topics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminCreateTopic(@Body() body: any) { return this.grammarService.adminCreateTopic(body); }

  @Patch('admin/topics/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminUpdateTopic(@Param('id') id: string, @Body() body: any) { return this.grammarService.adminUpdateTopic(id, body); }

  @Delete('admin/topics/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminDeleteTopic(@Param('id') id: string) { return this.grammarService.adminDeleteTopic(id); }

  @Get('admin/topics/:id/lessons')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminGetLessons(@Param('id') topicId: string) { return this.grammarService.adminGetLessons(topicId); }

  @Post('admin/topics/:id/lessons')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminCreateLesson(@Param('id') topicId: string, @Body() body: any) { return this.grammarService.adminCreateLesson(topicId, body); }

  @Patch('admin/lessons/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminUpdateLesson(@Param('id') id: string, @Body() body: any) { return this.grammarService.adminUpdateLesson(id, body); }

  @Delete('admin/lessons/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  adminDeleteLesson(@Param('id') id: string) { return this.grammarService.adminDeleteLesson(id); }
}
