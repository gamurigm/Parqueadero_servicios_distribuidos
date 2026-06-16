import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateRolesUsuarioDto {
    @IsUUID()
    @IsNotEmpty()
    id_user!: string;

    @IsUUID()
    @IsNotEmpty()
    id_rol!: string;
}
