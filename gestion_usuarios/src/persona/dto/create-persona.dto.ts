import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsEmail,
  Length,
  Matches,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreatePersonaDto {

  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El primer nombre solo puede ser letras'
    })
   @ApiProperty({
    example: 'Juan',
    description: 'Primer nombre de la persona',
    minLength: 1,
    maxLength: 30
  })
  firstName!: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El segundo nombre solo puede ser letras'
    })
  @ApiPropertyOptional({
    example: 'Carlos',
    description: 'Segundo nombre de la persona (opcional)',
    minLength: 1,
    maxLength: 30
  })
  middleName?: string;

  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El apellido solo puede ser letras'
    })
  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido de la persona',
    minLength: 1,
    maxLength: 30
  })
  lastName!: string;

  @Length(10, 10, { message: 'El DNI debe tener exactamente 10 dígitos' })
  @Matches(/^\d{10}$/, { 
    message: 'El DNI debe contener solo números (10 dígitos)' 
  })
  @ApiProperty({
    example: '1234567890',
    description: 'DNI de la persona (10 dígitos)',
    minLength: 10,
    maxLength: 10
  })
  dni!: string;

  @IsEmail()
  @ApiProperty({
    example: 'juan.perez@email.com',
    description: 'Correo electrónico de la persona'
  })
  email!: string;

  @IsString()
  @Length(5, 200)
  @ApiProperty({
    example: 'Calle Principal 123',
    description: 'Dirección de la persona',
    minLength: 5,
    maxLength: 200
  })
  address!: string;

  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'La Nacionalidad solo puede ser letras'
    })
  @ApiProperty({
    example: 'Ecuatoriana',
    description: 'Nacionalidad de la persona',
    minLength: 1,
    maxLength: 30
  })
  nationality!: string;

  @IsString()
  @Length(10, 10, { message: 'El celular debe tener exactamente 10 dígitos' })
  @Matches(/^\d[0-9]{7,15}$/)
  @ApiProperty({
    example: '0987654321',
    description: 'Número de teléfono celular (10 dígitos)',
    minLength: 10,
    maxLength: 10
  })
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El tipo solo es letras'
    })
  @ApiProperty({
    example: 'Cliente',
    description: 'Tipo de persona (ej: Cliente, Empleado, etc.)'
  })
  tipo!:string;
}
