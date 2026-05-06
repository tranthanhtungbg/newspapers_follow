// Admin Module — User management, backups, logs
import { Module, Controller, Get, Query, UseGuards, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = params.search
      ? { OR: [{ email: { contains: params.search } }, { name: { contains: params.search } }] }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(@Query() query: Record<string, string>) {
    return this.admin.listUsers(query as never);
  }
}

@Module({
  controllers: [AdminController],
  providers: [AdminService, RolesGuard],
})
export class AdminModule {}
