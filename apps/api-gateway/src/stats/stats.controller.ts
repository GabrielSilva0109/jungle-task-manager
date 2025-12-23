import {
  Controller,
  Get,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Statistics')
@Controller('stats')
// Temporarily remove auth guard for testing
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request
  ) {
    // Use header user ID or fallback to hardcoded
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.statsService.getDashboardStats(currentUserId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request
  ) {
    // Use header user ID or fallback to hardcoded
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.statsService.getUserStats(currentUserId);
  }

  @Get('users-ranking')
  @ApiOperation({ summary: 'Get users ranking by completed tasks' })
  async getUsersRanking(
    @Headers('x-user-id') userId?: string,
    @Req() req?: Request
  ) {
    const currentUserId = userId || (req?.user && (req.user as any).userId) || '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.statsService.getUsersRanking(currentUserId);
  }
}