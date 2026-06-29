export declare class Utils {
    private readonly uuidRegex;
    validateUUID(id: string): string;
    sanitizeString(name: string, value: string | undefined): string;
    escapeHtml(value: string): string;
    compareStringsIgnoreCase(value1: string, value2: string, str1: string, str2: string): boolean;
}
