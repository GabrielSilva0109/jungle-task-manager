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
// Temporarily remove auth guard for testing
// @UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Req() req: Request) {
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = req.user && (req.user as any).userId ? (req.user as any).userId : '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.statsService.getDashboardStats(userId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(@Req() req: Request) {
    // Temporary fix: use hardcoded userId when auth is disabled
    const userId = req.user && (req.user as any).userId ? (req.user as any).userId : '8f366c55-7522-4142-956f-21c348dda0ee';
    return this.statsService.getUserStats(userId);
  }
}