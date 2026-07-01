import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'BAD_REQUEST' })
  error: string;

  @ApiProperty({ example: 'Descripción clara del error' })
  message: string;

  @ApiPropertyOptional({ example: ['La cédula debe contener solo dígitos'] })
  details?: string[];
}
