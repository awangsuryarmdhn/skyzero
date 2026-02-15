import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Sesuaikan path
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Fungsi Validasi User
  async validateUser(email: string, pass: string): Promise<any> {
    // Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Jika user tidak ada, throw error
    if (!user) {
      throw new UnauthorizedException('Email tidak ditemukan');
    }

    // Cek password (bandingkan inputan user dgn hash di DB)
    const isMatch = await bcrypt.compare(pass, user.password);

    if (isMatch) {
      // Jika cocok, kembalikan data user (tanpa password)
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Password salah');
  }

  // 2. Fungsi Login (Generate Token)
  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload), // Ini token kuncinya
      user: user,
    };
  }
}
