import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Aktifkan CORS (Agar Frontend bisa akses data)
  app.enableCors();

  // 2. Ganti Port jadi 4000
  await app.listen(4000);
}
void bootstrap();
