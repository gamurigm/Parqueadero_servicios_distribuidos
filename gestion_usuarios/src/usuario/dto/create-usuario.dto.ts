import { IsString, IsUUID, MinLength, IsNotEmpty, Max, maxLength, MaxLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsUUID()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
