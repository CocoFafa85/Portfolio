import { describe, expect, it } from 'vitest';
import {
    describeDate, formatCircuitTime, msUntilNextMinute, padDigits, parseLocalDateTime, resolvePresent, toTwelveHour,
} from './time';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

describe('parseLocalDateTime', () => {
    it('reads a local date and time (data F1)', () => {
        // Arrange / Act
        const date = parseLocalDateTime('2015-05-01T22:04');

        // Assert
        expect(date).not.toBeNull();
        expect([date?.getFullYear(), date?.getMonth(), date?.getDate(), date?.getHours(), date?.getMinutes()]).toEqual([2015, 4, 1, 22, 4]);
    });

    it('rejects a malformed text and an impossible date', () => {
        // Arrange / Act / Assert
        expect(parseLocalDateTime('14/06/2035')).toBeNull();
        expect(parseLocalDateTime('2035-02-30T10:00')).toBeNull();
        expect(parseLocalDateTime('2035-06-14T24:00')).toBeNull();
    });
});

describe('toTwelveHour', () => {
    it('maps midnight and noon to 12, the afternoon to PM', () => {
        // Arrange / Act / Assert
        expect(toTwelveHour(0)).toEqual({ hour: 12, pm: false });
        expect(toTwelveHour(9)).toEqual({ hour: 9, pm: false });
        expect(toTwelveHour(12)).toEqual({ hour: 12, pm: true });
        expect(toTwelveHour(22)).toEqual({ hour: 10, pm: true });
    });
});

describe('padDigits', () => {
    it('pads with zeros to the field width', () => {
        // Arrange / Act / Assert
        expect(padDigits(4, 2)).toBe('04');
        expect(padDigits(2035, 4)).toBe('2035');
        expect(padDigits(7, 4)).toBe('0007');
    });
});

describe('formatCircuitTime', () => {
    it('shows the past as LAST TIME DEPARTED: MAY 01 2015 10:04 PM', () => {
        // Arrange
        const past = new Date(2015, 4, 1, 22, 4);

        // Act
        const time = formatCircuitTime(past, MONTHS);

        // Assert
        expect(time).toEqual({ month: 'MAY', day: '01', year: '2015', hour: '10', minute: '04', pm: true });
    });

    it('shows the future as DESTINATION TIME: JUN 14 2035 04:29 PM', () => {
        // Arrange
        const future = new Date(2035, 5, 14, 16, 29);

        // Act
        const time = formatCircuitTime(future, MONTHS);

        // Assert
        expect(time).toEqual({ month: 'JUN', day: '14', year: '2035', hour: '04', minute: '29', pm: true });
    });

    it('shows the fallback midnight as 12:00 AM', () => {
        // Arrange
        const fallback = new Date(2026, 8, 5, 0, 0);

        // Act
        const time = formatCircuitTime(fallback, MONTHS);

        // Assert
        expect(time).toEqual({ month: 'SEP', day: '05', year: '2026', hour: '12', minute: '00', pm: false });
    });
});

describe('resolvePresent', () => {
    const fallback = new Date(2026, 8, 5, 0, 0);

    it('keeps the visitor clock when it is valid', () => {
        // Arrange
        const now = new Date(2026, 9, 7, 13, 58);

        // Act
        const present = resolvePresent(now, fallback);

        // Assert
        expect(present).toEqual({ date: now, live: true });
    });

    it('falls back to 05/09/2026 when the clock is missing or invalid', () => {
        // Arrange / Act
        const missing = resolvePresent(null, fallback);
        const invalid = resolvePresent(new Date(Number.NaN), fallback);

        // Assert
        expect(missing).toEqual({ date: fallback, live: false });
        expect(invalid).toEqual({ date: fallback, live: false });
    });
});

describe('msUntilNextMinute', () => {
    it('waits for the end of the current minute', () => {
        // Arrange
        const midMinute = new Date(2026, 9, 7, 13, 58, 30, 250);
        const onTheMinute = new Date(2026, 9, 7, 13, 59, 0, 0);

        // Act / Assert
        expect(msUntilNextMinute(midMinute)).toBe(29_750);
        expect(msUntilNextMinute(onTheMinute)).toBe(60_000);
    });
});

describe('describeDate', () => {
    it('spells the date out in French for screen readers', () => {
        // Arrange
        const future = new Date(2035, 5, 14, 16, 29);

        // Act
        const words = describeDate(future, 'fr-FR');

        // Assert
        expect(words).toBe('14 juin 2035');
    });
});
