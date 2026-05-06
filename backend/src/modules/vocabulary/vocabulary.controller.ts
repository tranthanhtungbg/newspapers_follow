import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VocabularyService } from './vocabulary.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import {
  IsString, IsOptional, IsBoolean, IsInt, Min, IsArray, MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

class CreateVocabDto {
  @IsString() @MaxLength(500) word: string;
  @IsString() translation: string;
  @IsOptional() @IsString() ipa?: string;
  @IsOptional() @IsString() contextSentence?: string;
  @IsOptional() @IsString() contextUrl?: string;
  @IsOptional() @IsString() contextTitle?: string;
  @IsOptional() @IsString() partOfSpeech?: string;
  @IsOptional() examples?: unknown[];
  @IsOptional() collocations?: string[];
  @IsOptional() @IsArray() tags?: string[];
  @IsString() sourceLang: string;
  @IsString() targetLang: string;
}

class ListVocabDto {
  @IsOptional() @IsInt() @Min(1) @Transform(({ value }) => parseInt(value)) page?: number;
  @IsOptional() @IsInt() @Min(1) @Transform(({ value }) => parseInt(value)) limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsBoolean() @Transform(({ value }) => value === 'true') isMastered?: boolean;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() sortOrder?: 'asc' | 'desc';
}

class CreateCategoryDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() color?: string;
}

class UpdateCategoryDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() color?: string;
}

@Controller('vocabulary')
@UseGuards(AuthGuard('jwt'))
export class VocabularyController {
  constructor(private readonly vocab: VocabularyService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateVocabDto) {
    return this.vocab.create(user.id, dto as never);
  }

  @Get()
  list(@CurrentUser() user: User, @Query() query: ListVocabDto) {
    return this.vocab.list(user.id, query);
  }

  @Get('pins')
  getPins(@CurrentUser() user: User) {
    return this.vocab.getPins(user.id);
  }

  // ── Categories ────────────────────────────────────────────────

  @Get('categories')
  getCategories(@CurrentUser() user: User) {
    return this.vocab.getCategories(user.id);
  }

  @Post('categories')
  createCategory(@CurrentUser() user: User, @Body() dto: CreateCategoryDto) {
    return this.vocab.createCategory(user.id, dto.name, dto.color);
  }

  @Patch('categories/:id')
  updateCategory(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.vocab.updateCategory(user.id, id, dto.name, dto.color);
  }

  @Delete('categories/:id')
  deleteCategory(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.vocab.deleteCategory(user.id, id);
  }

  @Post('bulk-delete')
  bulkDelete(@CurrentUser() user: User, @Body('ids') ids: string[]) {
    return this.vocab.bulkDelete(user.id, ids);
  }

  @Post(':id/pin')
  pin(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body('categoryId') categoryId?: string) {
    return this.vocab.pin(user.id, id, categoryId);
  }

  @Delete(':id/pin')
  unpin(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.vocab.unpin(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<CreateVocabDto>,
  ) {
    return this.vocab.update(user.id, id, data as never);
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.vocab.delete(user.id, id);
  }
}
