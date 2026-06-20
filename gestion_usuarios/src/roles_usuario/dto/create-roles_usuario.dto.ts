import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateRolesUsuarioDto {
    @IsUUID()
    @IsNotEmpty()
    @IsString()
    id_user!: string;

    @IsUUID()
    @IsNotEmpty()
    @IsString()
    id_rol!: string;
}
