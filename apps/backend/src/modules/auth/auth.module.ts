import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { TokensService } from './tokens.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from '../../database/entities/user.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { LoginAttemptEntity } from '../../database/entities/login-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, LoginAttemptEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokensService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
