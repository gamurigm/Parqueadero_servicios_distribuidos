export declare const TARIFA_PROVIDER = "TARIFA_PROVIDER";
export interface ITarifaProvider {
    obtenerTarifaPorHora(tipoVehiculo: string, tipoEspacio: string): number;
}
