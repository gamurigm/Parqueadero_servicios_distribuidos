import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolesUsuarioDto {
    @IsUUID()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID del usuario'
    })
    id_user!: string;

    @IsUUID()
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440001',
        description: 'ID del rol'
    })
    id_rol!: string;
}