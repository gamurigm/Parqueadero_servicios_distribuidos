// factory-vehiculos.ts
import { BadRequestException } from "@nestjs/common";
import { CreateVehiculoDto } from "../dto/create-vehiculo.dto";
import { Vehiculo } from "../entities/vehiculo.entity";
import { Auto } from "../entities/tipos/auto.entity";
import { Camioneta } from "../entities/tipos/camioneta.entity";
import { Motocicleta } from "../entities/tipos/motocicleta.entity";
import { Utils } from "../utils/utils";

export class FactoryVehiculos {
  private static utils = new Utils();

  static crear(dto: CreateVehiculoDto, existingPlaca?: string): Vehiculo {
    const tipo = this.utils.sanitizeString("tipo",dto.tipo);
    const datosSanitizados = this.sanitizarDatos(dto.datos);
    
    if (existingPlaca && datosSanitizados.placa === existingPlaca) {
      throw new BadRequestException('La placa no puede ser la misma');
    }

    let vehiculo: Vehiculo;

    switch (tipo) {
      case 'auto':
        const auto = new Auto();
        Object.assign(auto, datosSanitizados);
        vehiculo = auto;
        break;
      case 'motocicleta':
        const moto = new Motocicleta();
        Object.assign(moto, datosSanitizados);
        vehiculo = moto;
        break;
      case 'camioneta':
        const camion = new Camioneta();
        Object.assign(camion, datosSanitizados);
        vehiculo = camion;
        break;
      default:
        throw new Error(`Tipo de vehículo no soportado: ${dto.tipo}`);
    }

    return vehiculo;
  }

  static sanitizarDatos(datos: any): any {
    const sanitized: any = {};

    if (datos.placa !== undefined) {
      sanitized.placa = this.utils.sanitizeString('placa', datos.placa);
    }

    if (datos.marca !== undefined) {
      sanitized.marca = this.utils.sanitizeString('marca', datos.marca);
    }

    if (datos.modelo !== undefined) {
      sanitized.modelo = this.utils.sanitizeModel(datos.modelo);
    }

    if (datos.color !== undefined) {
      sanitized.color = this.utils.sanitizeString('color', datos.color);
    }

    if (datos.anio !== undefined) {
      sanitized.anio = Number(datos.anio);
      if (isNaN(sanitized.anio) || sanitized.anio < 1900 || sanitized.anio > new Date().getFullYear() + 1) {
        throw new BadRequestException('Año inválido');
      }
    }

    if (datos.clasificacion !== undefined) {
      sanitized.clasificacion = this.utils.sanitizeString('clasificacion', datos.clasificacion);
    }

    if (datos.numeroPuertas !== undefined) {
      sanitized.numeroPuertas = Number(datos.numeroPuertas);
      if (isNaN(sanitized.numeroPuertas) || sanitized.numeroPuertas < 2 || sanitized.numeroPuertas > 5) {
        throw new BadRequestException('Número de puertas inválido');
      }
    }

    if (datos.capacidadMaletero !== undefined) {
      sanitized.capacidadMaletero = Number(datos.capacidadMaletero);
      if (isNaN(sanitized.capacidadMaletero) || sanitized.capacidadMaletero < 0) {
        throw new BadRequestException('Capacidad de maletero inválida');
      }
    }

    if (datos.cabina !== undefined) {
      sanitized.cabina = this.utils.sanitizeString('cabina', datos.cabina);
    }

    if (datos.capacidadCarga !== undefined) {
      sanitized.capacidadCarga = Number(datos.capacidadCarga);
      if (isNaN(sanitized.capacidadCarga) || sanitized.capacidadCarga < 0) {
        throw new BadRequestException('Capacidad de carga inválida');
      }
    }

    if (datos.tipoMoto !== undefined) {
      sanitized.tipoMoto = this.utils.sanitizeString('tipoMoto', datos.tipoMoto);
    }

    return sanitized;
  }


  static actualizar(dto: any, vehiculoExistente: Vehiculo): Vehiculo {
    const datosActualizados = this.sanitizarDatos(dto.datos || dto);
    
    Object.assign(vehiculoExistente, datosActualizados);
    
    return vehiculoExistente;
  }
}