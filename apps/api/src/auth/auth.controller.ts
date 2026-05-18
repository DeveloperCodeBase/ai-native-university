import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100) fullName?: string;
  @IsOptional() @IsString() phone?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return {
      success: true,
      data: await this.authService.login(dto),
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new student account' })
  async register(@Body() dto: RegisterDto) {
    return {
      success: true,
      data: await this.authService.register(dto),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return {
      success: true,
      data: await this.authService.refreshToken(dto.refreshToken),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Request() req: any) {
    return {
      success: true,
      data: req.user,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own profile (fullName, phone)' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return {
      success: true,
      data: await this.authService.updateProfile(tenantId, userId, dto),
    };
  }
}
