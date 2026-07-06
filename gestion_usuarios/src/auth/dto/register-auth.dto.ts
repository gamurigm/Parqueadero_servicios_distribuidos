import { IsString, MinLength, IsNotEmpty, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


export class RegisterAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1722233445', description: 'Cédula de identidad' })
  cedula!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Juan', description: 'Primer nombre' })
  firstName!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Carlos', description: 'Segundo nombre' })
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Pérez', description: 'Apellidos del usuario' })
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'juan.perez@gmail.com', description: 'Correo electrónico' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ecuatoriana', description: 'Nacionalidad' })
  nationality!: string;

  @IsString()
  @MinLength(10)
  @ApiProperty({ example: '0987654321', description: 'Número de celular (10 dígitos)' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Calle Principal 123', description: 'Dirección' })
  address!: string;

  @IsUUID('all', { message: 'rolId debe ser un UUID válido' })
  @IsNotEmpty()
  @ApiProperty({ example: 'f311601b-6143-4fd0-aea7-8536c7c6e2fa', description: 'ID (UUID) del rol a asignar al usuario' })
  rolId!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'Password123', description: 'Contraseña (mínimo 6 caracteres)', minLength: 6 })
  password!: string;
}
