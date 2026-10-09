/** Logic of the Projects trajectory (LOT 5): pure, no React, no DOM. */

/** The year a time-circuit display can show: four digits, or null (a year still to provide). */
export function yearDigits(year: string): string | null {
    return /^\d{4}$/.test(year) ? year : null;
}

/** Side of the axis a card sits on, in reading order: left, right, left… (staggered, from 1024 px) */
export function sideOf(index: number): 'left' | 'right' {
    return index % 2 === 0 ? 'left' : 'right';
}
