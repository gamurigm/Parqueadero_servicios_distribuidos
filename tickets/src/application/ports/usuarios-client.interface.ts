export const USUARIOS_CLIENT = 'USUARIOS_CLIENT';

export interface VehiculoInfo {
  placa: string;
  tipo: string;
}

export interface IUsuariosClient {
  obtenerVehiculosPorCedula(cedula: string): Promise<VehiculoInfo[]>;
}
