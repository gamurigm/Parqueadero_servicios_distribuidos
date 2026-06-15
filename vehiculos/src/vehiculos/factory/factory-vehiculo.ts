import { CreateVehiculoDto } from "../dto/create-vehiculo.dto";
import { Vehiculo } from "../entities/vehiculo.entity";
import { Auto } from "../entities/auto.entity";
import { Motocicleta } from "../entities/motocicleta.entity";
import { Camioneta } from "../entities/camioneta.entity";
import { Bus } from "../entities/bus.entity";
import { Buseta } from "../entities/buseta.entity";

export class FactoryVehiculos {
    static crear(dto: CreateVehiculoDto): Vehiculo {
        switch (dto.tipo) {
            case 'auto':
                const auto = new Auto();
                Object.assign(auto, dto.datos);
                return auto;
            case 'motocicleta':
                const moto = new Motocicleta();
                Object.assign(moto, dto.datos);
                return moto;
            case 'camioneta':
                const camion = new Camioneta();
                Object.assign(camion, dto.datos);
                return camion;
            case 'bus':
                const bus = new Bus();
                Object.assign(bus, dto.datos);
                return bus;
            case 'buseta':
                const buseta = new Buseta();
                Object.assign(buseta, dto.datos);
                return buseta;
            default:
                throw new Error(`Tipo de vehículo no soportado: ${ dto.tipo }`);
        }
    }
}