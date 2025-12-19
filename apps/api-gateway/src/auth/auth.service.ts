import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import {
  RegisterDto,
  LoginDto,
  AuthResponse,
  AuthTokens,
} from '@jungle/types';

@Injectable()
export class AuthService {
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';

  constructor(
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.authServiceUrl}/auth/register`, registerDto);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.authServiceUrl}/auth/login`, loginDto);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await axios.post(`${this.authServiceUrl}/auth/refresh`, { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await axios.post(`${this.authServiceUrl}/auth/logout`, { userId });
    } catch (error) {
      throw error;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.authServiceUrl}/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}