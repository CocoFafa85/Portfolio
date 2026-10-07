/**
 * Tab the arrow keys lead to in a tab list (WAI-ARIA tabs pattern):
 * next / previous with wrap-around (both arrow axes, the list may be laid
 * out either way), Home and End; -1 for any other key.
 */
export function nextTabIndex(key: string, current: number, count: number): number {
    if (count <= 0) return -1;
    switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
            return (current + 1) % count;
        case 'ArrowUp':
        case 'ArrowLeft':
            return (current - 1 + count) % count;
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        default:
            return -1;
    }
}
