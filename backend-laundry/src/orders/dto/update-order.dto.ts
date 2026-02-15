import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  // Validasi: Hanya terima status yang ada di database
  @IsBoolean()
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'Status harus PENDING, WASHING, IRONING, READY, atau COMPLETED',
  })
  status?: OrderStatus;
  isPaid?: boolean;
}
