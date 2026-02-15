import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
// Import Enum langsung dari Prisma Client agar sinkron 100%
import { ServiceType } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsBoolean()
  @IsString()
  @IsOptional()
  isPaid?: boolean;
  phone?: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  // Validasi: Hanya terima 'KILOAN', 'SATUAN', atau 'EXPRESS'
  @IsEnum(ServiceType, {
    message: 'Service type harus KILOAN, SATUAN, atau EXPRESS',
  })
  serviceType: ServiceType;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
