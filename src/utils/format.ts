/** Two-digit position label of a navigation entry, as shown in the bar: 0 → "01". */
export function formatNavIndex(index: number): string {
    return String(index + 1).padStart(2, '0');
}
