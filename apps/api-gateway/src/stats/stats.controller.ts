import {
  Controller,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statistics')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getDashboardStats(user.userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(@Req() req: Request) {
    const user = req.user as any;
    return this.statsService.getUserStats(user.userId);
  }
}