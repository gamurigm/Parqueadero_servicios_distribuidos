import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({
        example: true,
        description: 'Estado del rol (activo/inactivo)'
    })
    activo!: boolean;
}