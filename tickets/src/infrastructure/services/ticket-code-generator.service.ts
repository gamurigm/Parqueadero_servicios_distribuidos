import { Injectable } from '@nestjs/common';
import { ITicketCodeGenerator } from '../../application/ports/ticket-code-generator.interface';

@Injectable()
export class TicketCodeGeneratorService implements ITicketCodeGenerator {
  generar(idEspacio: string, tipoEspacio: string): string {
    const now = Date.now().toString();
    const espacioDigitos = idEspacio.replace(/\D/g, '').padStart(6, '0').slice(-6);
    const tipoDigito = tipoEspacio === 'reservado' ? '9' : '1';
    const timestampDigitos = now.slice(-9);

    const code = `${tipoDigito}${espacioDigitos}${timestampDigitos}`;
    return code.padEnd(16, '0').slice(0, 16);
  }
}
