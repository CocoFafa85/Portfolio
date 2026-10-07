/** One row of the DeLorean time circuits, as its displays show it (LOT 3, B1). */
export interface CircuitTime {
    /** Three letters, from the month labels (MAY) */
    month: string;
    /** Two digits each (01, 2015, 10, 04) */
    day: string;
    year: string;
    hour: string;
    minute: string;
    /** Lights the PM lamp, else the AM one */
    pm: boolean;
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** `YYYY-MM-DDTHH:mm` read in local time (as the visitor's clock); null when malformed or impossible (30 Feb). */
export function parseLocalDateTime(text: string): Date | null {
    const match = LOCAL_DATE_TIME.exec(text);
    if (!match) return null;
    const [year, month, day, hours, minutes] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    const exact = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        && date.getHours() === hours && date.getMinutes() === minutes;
    return exact ? date : null;
}

/** Zero-padded on `width` digits (4 → "04"). */
export function padDigits(value: number, width: number): string {
    return String(Math.trunc(value)).padStart(width, '0');
}

/** 24-hour clock to the 12-hour dial of the film: 0 → 12 AM, 12 → 12 PM, 22 → 10 PM. */
export function toTwelveHour(hours: number): { hour: number; pm: boolean } {
    return { hour: hours % 12 === 0 ? 12 : hours % 12, pm: hours >= 12 };
}

/** A date as the time circuits show it; `months` holds the twelve labels, January first. */
export function formatCircuitTime(date: Date, months: readonly string[]): CircuitTime {
    const { hour, pm } = toTwelveHour(date.getHours());
    return {
        month: months[date.getMonth()],
        day: padDigits(date.getDate(), 2),
        year: padDigits(date.getFullYear(), 4),
        hour: padDigits(hour, 2),
        minute: padDigits(date.getMinutes(), 2),
        pm,
    };
}

/** The present: the visitor's clock, or `fallback` when it is missing or invalid (`live` false: a reset clock). */
export function resolvePresent(now: Date | null | undefined, fallback: Date): { date: Date; live: boolean } {
    const valid = now instanceof Date && !Number.isNaN(now.getTime());
    return valid ? { date: now, live: true } : { date: fallback, live: false };
}

/** Milliseconds until the next minute starts: the present row redraws then, once a minute. */
export function msUntilNextMinute(date: Date): number {
    return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds());
}

/** The date in words for screen readers ("14 juin 2035"); the displays themselves are decorative. */
export function describeDate(date: Date, locale: string): string {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
