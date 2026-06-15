/**
 * TipoVehiculo
 *
 * Enum que actúa como clave del Registry.
 * OCP: para agregar un tipo nuevo solo se añade un valor aquí
 *      y se registra su servicio — sin tocar ningún controller.
 */
export enum TipoVehiculo {
  BUS = 'bus',
  BUSETA = 'buseta',
  MOTO = 'moto',
  CARRO = 'carro',
  CAMION = 'camion',
}
