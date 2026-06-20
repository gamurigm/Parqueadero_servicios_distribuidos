import { IsString, IsUUID, MinLength, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateUsuarioDto{
  @IsOptional()
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
