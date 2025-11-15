/**
 * Utility para manejar conversiones de Java Duration (ISO-8601 format)
 *
 * Formato ISO-8601 Duration: PT{hours}H{minutes}M
 * Ejemplos:
 * - PT8H30M → 8 horas 30 minutos
 * - PT4H → 4 horas
 * - PT12H0M → 12 horas
 */

export interface DurationComponents {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

export class DurationUtils {
  /**
   * Convierte un string de Java Duration (ISO-8601) a componentes
   * @param isoDuration - String en formato ISO-8601 (ej: "PT8H30M")
   * @returns Objeto con horas, minutos y total de minutos
   *
   * @example
   * DurationUtil.parse("PT8H30M") // { hours: 8, minutes: 30, totalMinutes: 510 }
   * DurationUtil.parse("PT4H") // { hours: 4, minutes: 0, totalMinutes: 240 }
   */
  static parse(isoDuration: string | null): DurationComponents {
    if (!isoDuration) {
      return { hours: 0, minutes: 0, totalMinutes: 0 };
    }

    try {
      // Remover el prefijo "PT"
      const duration = isoDuration.replace('PT', '');

      // Extraer horas y minutos
      const hoursMatch = duration.match(/(\d+)H/);
      const minutesMatch = duration.match(/(\d+)M/);

      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

      return {
        hours,
        minutes,
        totalMinutes: (hours * 60) + minutes
      };
    } catch (error) {
      console.error('Error parsing ISO duration:', isoDuration, error);
      return { hours: 0, minutes: 0, totalMinutes: 0 };
    }
  }

  /**
   * Convierte horas y minutos a formato Java Duration (ISO-8601)
   * @param hours - Número de horas (1-24)
   * @param minutes - Número de minutos (0-59)
   * @returns String en formato ISO-8601
   *
   * @example
   * DurationUtil.toIsoDuration(8, 30) // "PT8H30M"
   * DurationUtil.toIsoDuration(4, 0) // "PT4H0M"
   */
  static toIsoDuration(hours: number, minutes: number): string {
    // Validar rangos
    const validHours = Math.max(0, Math.min(24, hours));
    const validMinutes = Math.max(0, Math.min(59, minutes));

    return `PT${validHours}H${validMinutes}M`;
  }

  /**
   * Convierte total de minutos a formato Java Duration (ISO-8601)
   * @param totalMinutes - Total de minutos
   * @returns String en formato ISO-8601
   *
   * @example
   * DurationUtil.fromMinutes(510) // "PT8H30M"
   * DurationUtil.fromMinutes(240) // "PT4H0M"
   */
  static fromMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return this.toIsoDuration(hours, minutes);
  }

  /**
   * Formatea un Duration ISO-8601 a formato legible en español
   * @param isoDuration - String en formato ISO-8601
   * @returns String legible (ej: "8h 30min", "4h")
   *
   * @example
   * DurationUtil.format("PT8H30M") // "8h 30min"
   * DurationUtil.format("PT4H") // "4h"
   */
  static format(isoDuration: string | null): string {
    if (!isoDuration) {
      return 'No configurado';
    }

    const { hours, minutes } = this.parse(isoDuration);

    if (hours === 0 && minutes === 0) {
      return 'No válido';
    }

    if (minutes > 0) {
      return `${hours}h ${minutes}min`;
    }

    return `${hours}h`;
  }

  /**
   * Valida si un Duration ISO-8601 está en el rango permitido
   * @param isoDuration - String en formato ISO-8601
   * @param minMinutes - Mínimo de minutos permitidos (default: 60 = 1h)
   * @param maxMinutes - Máximo de minutos permitidos (default: 1440 = 24h)
   * @returns true si es válido
   *
   * @example
   * DurationUtil.isValid("PT8H30M") // true
   * DurationUtil.isValid("PT0H30M") // false (menos de 1 hora)
   * DurationUtil.isValid("PT25H0M") // false (más de 24 horas)
   */
  static isValid(isoDuration: string | null, minMinutes: number = 60, maxMinutes: number = 1440): boolean {
    if (!isoDuration) return false;

    try {
      const { totalMinutes } = this.parse(isoDuration);
      return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
    } catch {
      return false;
    }
  }

  /**
   * Convierte formato HH:mm (usado en formularios) a ISO-8601
   * @param timeString - String en formato HH:mm (ej: "08:30")
   * @returns String en formato ISO-8601
   *
   * @example
   * DurationUtil.fromTimeString("08:30") // "PT8H30M"
   * DurationUtil.fromTimeString("04:00") // "PT4H0M"
   */
  static fromTimeString(timeString: string | null): string {
    if (!timeString) {
      return 'PT0H0M';
    }

    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      return this.toIsoDuration(hours || 0, minutes || 0);
    } catch (error) {
      console.error('Error converting time string to ISO duration:', timeString, error);
      return 'PT0H0M';
    }
  }

  /**
   * Convierte formato ISO-8601 a HH:mm (para formularios)
   * @param isoDuration - String en formato ISO-8601
   * @returns String en formato HH:mm
   *
   * @example
   * DurationUtil.toTimeString("PT8H30M") // "08:30"
   * DurationUtil.toTimeString("PT4H") // "04:00"
   */
  static toTimeString(isoDuration: string | null): string {
    if (!isoDuration) {
      return '00:00';
    }

    const { hours, minutes } = this.parse(isoDuration);
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  /**
   * Calcula el porcentaje de uso respecto a un máximo
   * @param isoDuration - String en formato ISO-8601
   * @param maxMinutes - Máximo de minutos (default: 720 = 12h)
   * @returns Porcentaje (0-100)
   *
   * @example
   * DurationUtil.getPercentage("PT8H0M", 720) // 66.67
   * DurationUtil.getPercentage("PT4H0M", 480) // 50
   */
  static getPercentage(isoDuration: string | null, maxMinutes: number = 720): number {
    if (!isoDuration || maxMinutes === 0) return 0;

    const { totalMinutes } = this.parse(isoDuration);
    return Math.min(100, Math.round((totalMinutes / maxMinutes) * 100));
  }
}
