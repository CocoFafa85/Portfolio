/** A text of content.ts with its "{key}" placeholders replaced; an unknown key stays as written. */
export function fillTemplate(template: string, values: Readonly<Record<string, string>>): string {
    return template.replace(/\{(\w+)\}/g, (placeholder, key: string) => values[key] ?? placeholder);
}

/** Two-digit position label of a navigation entry, as shown in the bar: 0 → "01". */
export function formatNavIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
}
