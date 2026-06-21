import { IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { TipoMoto } from "../entities/tipos/motocicleta.entity";
import { Type, Transform } from 'class-transformer';
import { Clasificacion } from "../entities/vehiculo.entity";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BaseVehiculoDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z]{3}-\d{3,4}$/, {
        message: 'La placa debe tener un formato válido (PVZ-1234)'
    })
    @ApiProperty({
        example: 'ABC-1234',
        description: 'Placa del vehículo'
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim().toUpperCase() : value
    )
    placa!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: 'La marca debe tener al menos 2 caracteres'
    })
    @MaxLength(30, {
        message: 'La marca debe tener menos de 30 caracteres'
    })
    @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/, {
        message: 'La marca solo puede contener letras y espacios'
    })
    @ApiProperty({
        example: 'Toyota',
        description: 'Marca del vehículo'
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    marca!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: 'El modelo debe tener al menos 2 caracteres'
    })
    @MaxLength(150, {
        message: 'El modelo debe tener menos de 150 caracteres'
    })
    @Matches(/^[A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s\-]+$/, {
        message: 'El modelo solo puede contener letras y espacios'
    })
    @ApiProperty({
        example: 'Corolla',
        description: 'Modelo del vehículo'
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    modelo!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2, {
        message: 'El color debe tener al menos 2 caracteres'
    })
    @MaxLength(30, {
        message: 'El color debe tener menos de 30 caracteres'
    })
    @Matches(/^[A-Za-z\s\-áéíóúÁÉÍÓÚñÑ]+$/, {
        message: 'El color solo puede contener letras y espacios'
    })
    @ApiProperty({
        example: 'Blanco',
        description: 'Color del vehículo'
    })
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    color!: string;

    @Min(1885, {
        message: 'El año debe ser mayor o igual a 1885'
    })
    @IsInt({ message: 'El año debe ser un número entero' })
    @Max(new Date().getFullYear() + 1, {
        message: `El año debe ser menor o igual a ${new Date().getFullYear()}`
    })
    @ApiProperty({
        example: 2024,
        description: 'Año de fabricación'
    })
    @IsNotEmpty()
    anio!: number;

    @IsEnum(Clasificacion, {
        message: 'La clasificación debe ser: Electrico, Hibrido, Gasolina o Diesel'
    })
    @ApiProperty({
        enum: Clasificacion,
        example: Clasificacion.GASOLINA,
        description: 'Tipo de combustible'
    })
    @IsNotEmpty()
    clasificacion!: string;
}

class AutoDto extends BaseVehiculoDto {
    @IsInt()
    @Min(2, {
        message: "El número de puertas mínimo es 2"
    })
    @IsNotEmpty()
    @Max(7, {
        message: "El número de puertas máximo es 7"
    })
    @ApiProperty({
        example: 4,
        description: 'Número de puertas del auto'
    })
    numeroPuertas!: number;

    @IsNumber()
    @Min(0, {
        message: "La capacidad del maletero debe ser mayor a 1 kg"
    })
    @IsNotEmpty()
    @Max(1000, {
        message: "La capacidad del maletero no puede exceder 1000"
    })
    @ApiProperty({
        example: 450,
        description: 'Capacidad del maletero en litros'
    })
    capacidadMaletero!: number;
}

class MotocicletaDto extends BaseVehiculoDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^[A-Z]{2}-\d{3}[A-Z]$/, {
        message: 'La placa debe ser el siguiente formato (GG-420A)'
    })
    @ApiProperty({
        example: 'GG-420A',
        description: 'Placa de la motocicleta'
    })
    declare placa: string;

    @IsNotEmpty()
    @IsEnum(TipoMoto, {
        message: 'El tipo de motocicleta debe ser Deportiva, Scooter o Motocross'
    })
    @ApiProperty({
        enum: TipoMoto,
        example: TipoMoto.DEPORTIVA,
        description: 'Tipo de motocicleta'
    })
    tipo!: string;
}

class CamionetaDto extends BaseVehiculoDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(5, {
        message: 'La cabina no puede tener menos de 5 caracteres'
    })
    @ApiProperty({
        example: "Cabina Doble",
        description: 'Tipo de cabina'
    })
    @Transform(({ value }) => value.trim())
    cabina!: string;

    @IsNumber()
    @Min(0, {
        message: "La capacidad de carga debe ser mayor a 1 kg"
    })
    @IsNotEmpty()
    @Max(10000, {
        message: "La capacidad de carga no puede exceder 10000 kg"
    })
    @ApiProperty({
        example: 1500,
        description: 'Capacidad de carga en kg'
    })
    capacidadCarga!: number;
}

// DTO principal - VERSIÓN SIMPLIFICADA SIN $ref
export class CreateVehiculoDto {
    @IsIn(['auto', 'motocicleta', 'camioneta'])
    @ApiProperty({
        enum: ['auto', 'motocicleta', 'camioneta'],
        description: 'Tipo de vehículo a crear',
        example: 'auto'
    })
    tipo!: string;

    @ValidateNested()
    @Type((opts) => {
        const object = opts?.object as CreateVehiculoDto;
        if (!object) return BaseVehiculoDto;

        switch (object.tipo) {
            case 'auto':
                return AutoDto;
            case 'motocicleta':
                return MotocicletaDto;
            case 'camioneta':
                return CamionetaDto;
            default:
                return BaseVehiculoDto;
        }
    })
    @ApiProperty({
        description: 'Datos específicos según el tipo de vehículo',
        example: {
            placa: 'ABC-1234',
            marca: 'Toyota',
            modelo: 'Corolla',
            color: 'Blanco',
            anio: 2024,
            clasificacion: 'Gasolina',
            numeroPuertas: 4,
            capacidadMaletero: 450
        }
    })
    datos!: AutoDto | MotocicletaDto | CamionetaDto;
}