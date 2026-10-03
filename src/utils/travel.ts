/** Travel effect played when moving from one page to another (LOT 1, C2). */
export type TravelStyle = 'none' | 'hyperspace' | 'timeTravel' | 'timeTravelBack';

const HOME_PATH = '/';
const STYLES: readonly TravelStyle[] = ['none', 'hyperspace', 'timeTravel', 'timeTravelBack'];

/** Path without trailing slashes ("/about/" → "/about"); the home stays "/". */
export function normalizePath(path: string): string {
    const trimmed = path.replace(/\/+$/, '');
    return trimmed === '' ? HOME_PATH : trimmed;
}

export function isHomePath(path: string): boolean {
    return normalizePath(path) === HOME_PATH;
}

/**
 * Effect of a trip (decisions of 2026-10-03): hyperspace between the home page
 * and an inner page, both ways. Between inner pages, 88 mph: forward (left to
 * right, "timeTravel") when moving down `order` (the navigation bar order),
 * mirrored (right to left, "timeTravelBack") when moving up. A page outside
 * `order` (the 404) always travels forward.
 */
export function getTravelStyle(from: string, to: string, order: readonly string[] = []): TravelStyle {
    const origin = normalizePath(from);
    const destination = normalizePath(to);
    if (origin === destination) return 'none';
    if (isHomePath(origin) || isHomePath(destination)) return 'hyperspace';
    const ranks = order.map(normalizePath);
    const rankFrom = ranks.indexOf(origin);
    const rankTo = ranks.indexOf(destination);
    return rankFrom >= 0 && rankTo >= 0 && rankTo < rankFrom ? 'timeTravelBack' : 'timeTravel';
}

/** Both directions of the 88 mph trip share the same scenery. */
export function isTimeTravel(style: TravelStyle): boolean {
    return style === 'timeTravel' || style === 'timeTravelBack';
}

/** Narrows an untyped value (e.g. presence data) to a travel style. */
export function isTravelStyle(value: unknown): value is TravelStyle {
    return typeof value === 'string' && (STYLES as readonly string[]).includes(value);
}
