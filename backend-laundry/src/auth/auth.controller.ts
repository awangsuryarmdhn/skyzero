/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/saff-login.dto'; // Import DTO

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: LoginDto) {
    // Gunakan tipe data LoginDto
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password,
    );
    return this.authService.login(user);
  }
}
