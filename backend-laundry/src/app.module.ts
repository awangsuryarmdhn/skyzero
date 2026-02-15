// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service'; // <--- Import
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [OrdersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService], // <--- Tambahkan di sini
})
export class AppModule {}
