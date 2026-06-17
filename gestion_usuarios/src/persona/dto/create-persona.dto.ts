import {
  IsString,
  IsEmail,
  Length,
  Matches,
  IsOptional,
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

  @IsString()
  @Matches(/^\d{10}$/)
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
  @Matches(/^\d{7,15}$/)
  phone!: string;
}
