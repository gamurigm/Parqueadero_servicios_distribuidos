import { IsString, IsUUID, MinLength, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { CreatePersonaDto } from '../../persona/dto/create-persona.dto';

export class CreateUsuarioDto extends CreatePersonaDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
