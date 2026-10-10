import type { ProjectEntry, ProjectLabels } from '../types/models';
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

type Dated = Pick<ProjectEntry, 'status' | 'year'>;

/**
 * Year line of a card: the year it was finished, the planned release while in progress, "in
 * development" while in progress without a date; empty for a finished project without a year.
 */
export function yearLabel(entry: Dated, labels: Pick<ProjectLabels, 'plannedYear' | 'undated'>): string {
    if (!isInProgress(entry)) return entry.year ?? '';
    return entry.year ? fillTemplate(labels.plannedYear, { year: entry.year }) : labels.undated;
}

/** Construction tape of a project in progress: with its planned release, or "in development" alone. */
export function ribbonLabel(entry: Dated, labels: Pick<ProjectLabels, 'inProgress' | 'undated'>): string {
    return entry.year ? fillTemplate(labels.inProgress, { year: entry.year }) : labels.undated;
}
