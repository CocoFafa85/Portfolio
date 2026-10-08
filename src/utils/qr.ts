/**
 * QR helpers (LOT 4, B4). The code itself is drawn once in a canvas by the
 * HoloCard (QrCanvas): an SVG mask of it cost a long frame on a slow phone.
 */

/** A finder pattern (7 × 7 ring + 3 × 3 core) at a corner of the matrix: a quick sanity check. */
export function hasFinderAt(rows: readonly string[], top: number, left: number): boolean {
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            const ring = y === 0 || y === 6 || x === 0 || x === 6;
            const core = y >= 2 && y <= 4 && x >= 2 && x <= 4;
            if ((rows[top + y]?.[left + x] === '1') !== (ring || core)) return false;
        }
    }
    return true;
}
