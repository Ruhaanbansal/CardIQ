import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity';
import { LoginAttemptEntity } from '../../database/entities/login-attempt.entity';
import { PasswordService } from './password.service';
import { TokensService } from './tokens.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(LoginAttemptEntity)
    private readonly loginAttemptRepository: Repository<LoginAttemptEntity>,
    private readonly passwordService: PasswordService,
    private readonly tokensService: TokensService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      isActive: true,
    });

    await this.userRepository.save(user);

    return { message: 'Registration successful' };
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    // 1. Fetch user including password hash (select: false in entity by default)
    const user = await this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email: dto.email })
      .addSelect('user.passwordHash')
      .addSelect('user.accountLockedUntil')
      .addSelect('user.failedLoginAttempts')
      .getOne();

    if (!user) {
      await this.logAttempt(dto.email, ipAddress, userAgent, false, 'User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      await this.logAttempt(dto.email, ipAddress, userAgent, false, 'Account locked');
      throw new UnauthorizedException('Account is locked due to too many failed attempts');
    }

    if (!user.passwordHash) {
      await this.logAttempt(dto.email, ipAddress, userAgent, false, 'No password set (OAuth user)');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.verify(user.passwordHash, dto.password);

    if (!isValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
      }
      await this.userRepository.save(user);
      
      await this.logAttempt(dto.email, ipAddress, userAgent, false, 'Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Success
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    await this.logAttempt(dto.email, ipAddress, userAgent, true);

    const tokens = await this.tokensService.generateTokens(user, ipAddress, userAgent);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.tokensService.revokeToken(refreshToken);
    return { message: 'Logged out successfully' };
  }

  private async logAttempt(email: string, ipAddress: string, userAgent: string, isSuccess: boolean, failureReason?: string) {
    await this.loginAttemptRepository.save({
      email,
      ipAddress,
      userAgent,
      isSuccess,
      failureReason,
    });
  }
}
