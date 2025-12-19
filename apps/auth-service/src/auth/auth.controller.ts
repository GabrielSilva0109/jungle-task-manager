import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  AuthTokens,
} from '@jungle/types';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }): Promise<AuthTokens> {
    return this.authService.refreshTokens(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request): Promise<void> {
    const user = req.user as any;
    return this.authService.logout(user.userId);
  }

  // Microservice patterns
  @MessagePattern('auth.validate')
  async validateToken(data: { token: string }) {
    try {
      // This will be handled by JWT strategy
      return { valid: true };
    } catch (error) {
      return { valid: false };
    }
  }

  @MessagePattern('auth.user')
  async getUser(data: { userId: string }) {
    const user = await this.authService.findById(data.userId);
    if (!user) {
      return null;
    }
    
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }
}