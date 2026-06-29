import { BadRequestException } from '@nestjs/common';

/**
 * Utilidades de validación y sanitización.
 * Mismo patrón que practica_clase (gestion_usuarios/utils/utils.ts).
 */
export class Utils {
    private readonly uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    public validateUUID(id: string): string {
        if (!id) throw new BadRequestException('ID no proporcionado');

        // Eliminar cualquier espacio en blanco (incluyendo en medio de los caracteres)
        const noSpaces = id.replace(/\s+/g, '');
        
        // Sanitizar contra posibles tags HTML o caracteres raros
        const cleaned = this.sanitizeString('id', noSpaces);

        if (!this.uuidRegex.test(cleaned)) {
            throw new BadRequestException('ID inválido: debe ser un UUID válido sin espacios en blanco');
        }

        return cleaned;
    }

    public sanitizeString(name: string, value: string | undefined): string {
        if (typeof value !== 'string') {
            throw new BadRequestException(name + ' no fue definido');
        }

        let cleaned = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

        // Eliminar tags HTML (Prevención básica XSS)
        cleaned = cleaned.replace(/<[^>]*>/g, '');

        // Prevenir comillas simples maliciosas (Prevención SQLi en crudo, aunque TypeORM ya nos protege)
        cleaned = cleaned.replace(/['";\\]/g, '');

        return cleaned;
    }

    public sanitizeText(value: string | undefined): string | null {
        if (!value) return null;

        let cleaned = value.trim().replace(/\s+/g, ' ');

        // Eliminar tags HTML (Prevención básica XSS)
        cleaned = cleaned.replace(/<[^>]*>/g, '');

        // Prevenir comillas maliciosas y caracteres de inyección SQL
        cleaned = cleaned.replace(/['";\\]/g, '');

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

    public compareStringsIgnoreCase(value1: string, value2: string, str1: string, str2: string): boolean {
        if (!str1 || !str2) return false;
        const sanitized1 = this.sanitizeString(value1, str1).toLowerCase();
        const sanitized2 = this.sanitizeString(value2, str2).toLowerCase();
        return sanitized1 === sanitized2;
    }
}
