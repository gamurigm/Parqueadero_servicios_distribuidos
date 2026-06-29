import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'some-hex-refresh-token', description: 'Refresh token' })
  refreshToken!: string;
}
