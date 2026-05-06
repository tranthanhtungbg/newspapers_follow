import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FlashcardService } from './flashcard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsInt, Min, Max, IsNumber } from 'class-validator';
import type { User } from '@prisma/client';

class ReviewDto {
  @IsInt() @Min(0) @Max(5) score: number;
  @IsNumber() durationMs: number;
}

@Controller('flashcards')
@UseGuards(AuthGuard('jwt'))
export class FlashcardController {
  constructor(private readonly flashcard: FlashcardService) {}

  @Get('due-today')
  getDueToday(
    @CurrentUser() user: User,
    @Query('cram') cram?: string,
    @Query('date') date?: string,
  ) {
    return this.flashcard.getDueToday(user.id, cram === 'true', date);
  }

  @Post(':id/review')
  review(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) vocabId: string,
    @Body() dto: ReviewDto,
  ) {
    return this.flashcard.review(user.id, vocabId, dto.score, dto.durationMs);
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.flashcard.getStats(user.id);
  }
}
