import { IsString, IsUUID, MinLength, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario (opcional)'
  })
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({
    example: 'juan.perez',
    description: 'Nombre de usuario',
    minLength: 1,
    maxLength: 10
  })
  username!: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'Password123',
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    minLength: 8
  })
  password!: string;
}