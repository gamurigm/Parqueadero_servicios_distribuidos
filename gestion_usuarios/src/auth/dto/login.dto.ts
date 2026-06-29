import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @ApiProperty({ example: 'jperez', description: 'Nombre de usuario', maxLength: 10 })
  username!: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'Password123', description: 'Contraseña del usuario', minLength: 8 })
  password!: string;
}
