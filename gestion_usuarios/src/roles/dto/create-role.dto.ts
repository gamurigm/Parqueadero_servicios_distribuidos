import { IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator";

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    nombre!:string;

    @IsString()
    @IsNotEmpty()
    descripcion!: string
}
