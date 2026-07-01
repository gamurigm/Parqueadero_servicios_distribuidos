export const ZONAS_CLIENT = 'ZONAS_CLIENT';

export interface EspacioInfo {
  id: string;
  tipo: string;
  estado: string;
}

export interface IZonasClient {
  obtenerEspacio(idEspacio: string): Promise<EspacioInfo | null>;
  marcarOcupado(idEspacio: string): Promise<void>;
  marcarLibre(idEspacio: string): Promise<void>;
}
