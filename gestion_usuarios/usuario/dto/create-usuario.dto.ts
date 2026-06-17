import { IsString, IsUUID, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUsuarioDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
