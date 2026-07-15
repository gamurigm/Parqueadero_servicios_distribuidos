import { ITicketCodeGenerator } from '../../application/ports/ticket-code-generator.interface';
export declare class TicketCodeGeneratorService implements ITicketCodeGenerator {
    generar(idEspacio: string, tipoEspacio: string): string;
}
