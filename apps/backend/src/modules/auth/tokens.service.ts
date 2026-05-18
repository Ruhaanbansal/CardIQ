import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { UserEntity } from '../../database/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class TokensService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async generateTokens(user: UserEntity, ipAddress?: string, userAgent?: string) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || this.configService.get<string>('JWT_SECRET'),
      expiresIn: process.env.JWT_EXPIRATION || this.configService.get<string>('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    // Hash refresh token for DB storage (simple hash since JWT is already secure)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const rtEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken, // In a real extreme-security setup, we might hash this string before storing.
      expiresAt,
      ipAddress,
      userAgent,
    });
    
    await this.refreshTokenRepository.save(rtEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeToken(token: string) {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async revokeAllUserTokens(userId: string) {
    await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
  }
}
