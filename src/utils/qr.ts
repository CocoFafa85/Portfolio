/**
 * SVG of a QR code module matrix (LOT 4, B4): one string per row, '1' = dark.
 * Horizontal runs of dark modules merge into one rectangle (a short path);
 * a quiet zone of `quiet` modules surrounds the code, as scanners need.
 */
export function qrSvg(rows: readonly string[], dark: string, light: string, quiet = 4): string {
    const size = rows.length + quiet * 2;
    let path = '';
    rows.forEach((row, y) => {
        let x = 0;
        while (x < row.length) {
            if (row[x] !== '1') {
                x++;
                continue;
            }
            const start = x;
            while (row[x] === '1') x++;
            path += `M${start + quiet} ${y + quiet}h${x - start}v1h-${x - start}z`;
        }
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}

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
