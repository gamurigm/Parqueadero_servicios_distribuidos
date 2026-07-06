export const VEHICULOS_CLIENT = 'VEHICULOS_CLIENT';

export interface VehiculoDetalle {
  id: string;
  placa: string;
  tipo: string;
  cedulaPropietario?: string;
}

export interface IVehiculosClient {
  buscarPorPlaca(placa: string, authHeader?: string): Promise<VehiculoDetalle | null>;
}