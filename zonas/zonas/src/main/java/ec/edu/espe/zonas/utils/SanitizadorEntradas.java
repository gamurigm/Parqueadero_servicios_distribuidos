package ec.edu.espe.zonas.utils;

public class SanitizadorEntradas {

    /**
     * Aplica trim y colapsa múltiples espacios internos en uno solo.
     * Ejemplo: "  Zona   VIP  " -> "Zona VIP"
     */
    public static String trimYNormalizar(String s) {
        if (s == null) return null;
        return s.trim().replaceAll("\\s+", " ");
    }

    /**
     * Normaliza un string para comparaciones case-insensitive seguras.
     * Ejemplo: "  ZONA vip  Norte " -> "zona vip norte"
     */
    public static String normalizarParaComparacion(String s) {
        if (s == null) return null;
        return trimYNormalizar(s).toLowerCase();
    }

    /**
     * Detecta patrones comunes de inyección HTML/Scripts de manera simple.
     * Retorna true si detecta contenido sospechoso.
     */
    public static boolean contieneHtmlOScripts(String s) {
        if (s == null) return false;
        String lowerS = s.toLowerCase();
        return lowerS.contains("<script") || 
               lowerS.contains("javascript:") || 
               lowerS.contains("<img") || 
               lowerS.contains("onload=") || 
               lowerS.contains("onerror=") || 
               lowerS.contains("onclick=") ||
               lowerS.contains("<a ") ||
               lowerS.contains("href=");
    }

    /**
     * Valida si un string contiene solo los caracteres definidos en el regex.
     */
    public static boolean contieneSoloCaracteresPermitidos(String s, String regex) {
        if (s == null) return true; // si es opcional, validar @NotBlank aparte
        return s.matches(regex);
    }
}
