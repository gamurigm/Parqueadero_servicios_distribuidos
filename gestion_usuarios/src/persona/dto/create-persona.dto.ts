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
  firstName!: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El segundo nombre solo puede ser letras'
    })
  middleName?: string;

  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El apellido solo puede ser letras'
    })
  lastName!: string;

  @Length(10, 10, { message: 'El DNI debe tener exactamente 10 dígitos' })
  @Matches(/^\d{10}$/, { 
    message: 'El DNI debe contener solo números (10 dígitos)' 
  })
  dni!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(5, 200)
  address!: string;

  @IsString()
  @Length(1, 30)
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'La Nacionalidad solo puede ser letras'
    })
  nationality!: string;

  @IsString()
  @Length(10, 10, { message: 'El celular debe tener exactamente 10 dígitos' })
  @Matches(/^\d[0-9]{7,15}$/)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/,{
        message: 'El tipo solo es letras'
    })
  tipo!:string;
}
