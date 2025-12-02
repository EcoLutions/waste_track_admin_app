export class DateTimeUtils {
  private constructor() {}

  // -----------------------------
  // LOCAL DATE (yyyy-MM-dd)
  // -----------------------------
  static localDateToString(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString().slice(0, 10); // yyyy-MM-dd
  }

  static stringToLocalDate(dateString: string | null | undefined): Date | null {
    if (!dateString?.trim()) return null;
    try {
      // JS Date considera yyyy-MM-dd como UTC, opcionalmente ajustamos a local
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return null;
    }
  }

  // -----------------------------
  // LOCAL TIME (HH:mm:ss)
  // -----------------------------
  static localTimeToString(date: Date | null | undefined): string | null {
    if (!date) return null;
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  static stringToLocalTime(timeString: string | null | undefined): Date | null {
    if (!timeString?.trim()) return null;
    try {
      const [hh, mm, ss] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hh, mm, ss, 0);
      return date;
    } catch {
      return null;
    }
  }

  // -----------------------------
  // LOCAL DATE TIME (yyyy-MM-ddTHH:mm:ss)
  // -----------------------------
  static localDateTimeToString(date: Date | null | undefined): string | null {
    if (!date) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;
  }

  static stringToLocalDateTime(dateTimeString: string | null | undefined): Date | null {
    if (!dateTimeString?.trim()) return null;
    try {
      return new Date(dateTimeString); // JS interpreta ISO 8601
    } catch {
      return null;
    }
  }

  // -----------------------------
  // ISO DATE (UTC)
  // -----------------------------
  static dateToIsoString(date: Date | null | undefined): string | null {
    return date ? date.toISOString() : null;
  }

  static isoStringToDate(isoString: string | null | undefined): Date | null {
    if (!isoString?.trim()) return null;
    try {
      return new Date(isoString);
    } catch {
      return null;
    }
  }
}
