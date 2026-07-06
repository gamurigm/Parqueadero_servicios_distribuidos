import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Estado activo del usuario', example: true, required: false })
  active?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ description: 'Nueva contraseña del usuario', example: 'Password123', minLength: 8, required: false })
  password?: string;
}
