import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @ApiProperty({ example: 'jperez', description: 'Nombre de usuario', maxLength: 15 })
  username!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'Password123', description: 'Contraseña del usuario', minLength: 6 })
  password!: string;
}
