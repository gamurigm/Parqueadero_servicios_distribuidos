import { IsString, MinLength, IsNotEmpty, IsOptional, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1722233445', description: 'Cedula de identidad' })
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
  @ApiProperty({ example: 'Perez', description: 'Apellidos del usuario' })
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'juan.perez@gmail.com', description: 'Correo electronico' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Ecuatoriana', description: 'Nacionalidad' })
  nationality!: string;

  @IsString()
  @MinLength(10)
  @ApiProperty({ example: '0987654321', description: 'Numero de celular (10 digitos)' })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Calle Principal 123', description: 'Direccion' })
  address!: string;

  @IsOptional()
  @IsUUID('all', { message: 'rolId debe ser un UUID valido' })
  @ApiPropertyOptional({
    example: 'f311601b-6143-4fd0-aea7-8536c7c6e2fa',
    description: 'ID (UUID) del rol a asignar. Si se omite, se asigna propietario.',
  })
  rolId?: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'Password123', description: 'Contrasena (minimo 6 caracteres)', minLength: 6 })
  password!: string;
}
