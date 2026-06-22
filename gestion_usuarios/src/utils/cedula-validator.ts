import { Utils } from './utils';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

export function esCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;

  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito > 5) return false;

  const digitos = cedula.split('').map(Number);
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];

  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let producto = digitos[i] * coeficientes[i];
    if (producto > 9) producto -= 9;
    suma += producto;
  }

  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === digitos[9];
}

@ValidatorConstraint({ name: 'EsCedulaEcuatoriana', async: false })
export class EsCedulaEcuatorianaConstraint implements ValidatorConstraintInterface {
  private utils = new Utils();

  validate(cedula: string) {
    const cleaned = this.utils.sanitizeString('cédula', cedula);
    return esCedulaEcuatoriana(cleaned);
  }

  defaultMessage(args: ValidationArguments) {
    return 'La cédula ingresada no es una cédula ecuatoriana válida';
  }
}
