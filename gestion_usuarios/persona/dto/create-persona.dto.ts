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
  firstName!: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  middleName?: string;

  @IsString()
  @Length(1, 30)
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
  nationality!: string;

  @IsString()
  @Matches(/^\d{7,15}$/)
  phone!: string;
}
