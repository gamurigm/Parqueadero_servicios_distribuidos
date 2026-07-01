export const TICKET_CODE_GENERATOR = 'TICKET_CODE_GENERATOR';

export interface ITicketCodeGenerator {
  generar(idEspacio: string, tipoEspacio: string): string;
}
