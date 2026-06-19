import { BadRequestException } from "@nestjs/common";

export class Utils{
  private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  public validateUUID(id: string): string {
    const cleaned = this.sanitizeString('id', id);
    
    if (!this.uuidRegex.test(cleaned)) {
      throw new BadRequestException('ID inválido: debe ser un UUID válido');
    }
    
    return cleaned;
  }

  public sanitizeString(name:string,value: string | undefined): string {
    
    if ( typeof value !== 'string') {
      throw new BadRequestException(name+' no fue definido');
    }
    
    let cleaned = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    
    return cleaned;
  }

  escapeHtml(value: string): string {
    if (!value) return value;
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return value.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
  }


  public compareStringsIgnoreCase(value1:string,value2:string,str1: string, str2: string): boolean {
    if (!str1 || !str2) return false;
    const sanitized1 = this.sanitizeString(value1,str1).toLowerCase();
    const sanitized2 = this.sanitizeString(value2,str2).toLowerCase();
    return sanitized1 === sanitized2;
  }

}