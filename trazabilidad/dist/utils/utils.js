"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const common_1 = require("@nestjs/common");
class Utils {
    constructor() {
        this.uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    }
    validateUUID(id) {
        if (!id)
            throw new common_1.BadRequestException('ID no proporcionado');
        const noSpaces = id.replace(/\s+/g, '');
        const cleaned = this.sanitizeString('id', noSpaces);
        if (!this.uuidRegex.test(cleaned)) {
            throw new common_1.BadRequestException('ID inválido: debe ser un UUID válido sin espacios en blanco');
        }
        return cleaned;
    }
    sanitizeString(name, value) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException(name + ' no fue definido');
        }
        let cleaned = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/['";\\]/g, '');
        return cleaned;
    }
    sanitizeText(value) {
        if (!value)
            return null;
        let cleaned = value.trim().replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/<[^>]*>/g, '');
        cleaned = cleaned.replace(/['";\\]/g, '');
        return cleaned;
    }
    escapeHtml(value) {
        if (!value)
            return value;
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };
        return value.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
    }
    compareStringsIgnoreCase(value1, value2, str1, str2) {
        if (!str1 || !str2)
            return false;
        const sanitized1 = this.sanitizeString(value1, str1).toLowerCase();
        const sanitized2 = this.sanitizeString(value2, str2).toLowerCase();
        return sanitized1 === sanitized2;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map