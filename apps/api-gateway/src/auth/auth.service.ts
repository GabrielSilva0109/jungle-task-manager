import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
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
  private readonly authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3010';

  constructor(
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${this.authServiceUrl}/register`, registerDto);
      return response.data as AuthResponse;
    } catch (error: any) {
      if (error.response) {
        // Repassar o erro do auth-service com a mensagem específica
        const status = error.response.status;
        const message = error.response.data?.message || 'Erro no registro';
        
        if (status === 400) {
          throw new BadRequestException(message);
        } else if (status === 409) {
          throw new ConflictException(message);
        }
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${this.authServiceUrl}/login`, loginDto);
      return response.data as AuthResponse;
    } catch (error: any) {
      if (error.response) {
        // Repassar o erro do auth-service com a mensagem específica
        const status = error.response.status;
        const message = error.response.data?.message || 'Erro de autenticação';
        
        if (status === 401) {
          throw new UnauthorizedException(message);
        }
      }
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await axios.post<AuthTokens>(`${this.authServiceUrl}/refresh`, { refreshToken });
      return response.data as AuthTokens;
    } catch (error) {
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await axios.post(`${this.authServiceUrl}/logout`, { userId });
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
      const response = await axios.get<any>(`${this.authServiceUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getUsers(requestingUserId: string): Promise<any[]> {
    try {
      const response = await axios.get<any[]>(`${this.authServiceUrl}/users`, {
        headers: {
          'x-user-id': requestingUserId
        }
      });
      return response.data;
    } catch (error) {
      return [];
    }
  }

  async updateUser(userId: string, updateData: { role?: string; isActive?: boolean }, requestingUserId: string): Promise<any> {
    try {
      const response = await axios.patch<any>(`${this.authServiceUrl}/users/${userId}`, updateData, {
        headers: {
          'x-user-id': requestingUserId
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string, requestingUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(`${this.authServiceUrl}/users/${userId}`, {
        headers: {
          'x-user-id': requestingUserId
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}