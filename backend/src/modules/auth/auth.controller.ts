import {
  Controller, Post, Body, Get, UseGuards, Req, Res, HttpCode, HttpStatus, UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@prisma/client';

const REFRESH_COOKIE = 'lingoreader_refresh';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /auth/register
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.register(dto);
    return { user: result.user, tokens: result.tokens };
  }

  // POST /auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(req.user as User);
    return { user: result.user, tokens: result.tokens };
  }

  // POST /auth/refresh
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') rawToken: string) {
    if (!rawToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const result = await this.auth.refresh(rawToken);
    return { tokens: result.tokens };
  }

  // POST /auth/logout
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(
    @CurrentUser() user: User,
  ) {
    await this.auth.logout(user.id);
    return { message: 'Logged out successfully' };
  }

  // GET /auth/me
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@CurrentUser() user: User) {
    return this.auth.getMe(user.id);
  }
}
