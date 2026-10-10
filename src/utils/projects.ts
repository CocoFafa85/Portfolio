import type { ProjectEntry } from '../types/models';
import { fillTemplate } from './format';

/** Each entry of the list with its details, in the list's order (the Projects page's cards). */
export function withDetails<Id extends string, E extends { id: Id }, D extends object>(
    list: readonly E[],
    details: Readonly<Record<Id, D>>
): (E & D)[] {
    return list.map((entry) => ({ ...entry, ...details[entry.id] }));
}

/** A project still in development (its ribbon, its planned year): read from its status, never its id. */
export function isInProgress(entry: Pick<ProjectEntry, 'status'>): boolean {
    return entry.status === 'in-progress';
}

/** Year line of a card: the year it was finished, or the planned release while in progress. */
export function yearLabel(entry: Pick<ProjectEntry, 'status' | 'year'>, plannedYear: string): string {
    return isInProgress(entry) ? fillTemplate(plannedYear, { year: entry.year }) : entry.year;
}
