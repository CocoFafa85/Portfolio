/**
 * Code 128, code set B (printable ASCII): the HoloCard serial as a real,
 * scannable barcode (LOT 4, B3). Widths of bars and spaces in modules,
 * bar first; table checked against the ISO/IEC 15417 symbol table.
 */
const PATTERNS = (
    '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 ' +
    '123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 ' +
    '232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 ' +
    '313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 ' +
    '111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
    '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 ' +
    '114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'
).split(' ');

export const CODE128_START_B = 104;
export const CODE128_STOP = 106;

/** Widths (in modules) of the symbol of a value, bar first. */
export function symbolWidths(value: number): number[] {
    return [...PATTERNS[value]].map(Number);
}

/** Weighted modulo-103 check value: start + Σ position × value. */
export function code128Checksum(values: readonly number[]): number {
    return values.reduce((sum, value, index) => sum + value * Math.max(index, 1), 0) % 103;
}

/** Symbol values of a text in code set B, start, check and stop included. */
export function code128Values(text: string): number[] {
    const data = [...text].map((char) => {
        const code = char.charCodeAt(0);
        if (code < 32 || code > 127) throw new Error(`Code 128-B : caractère non codable « ${char} »`);
        return code - 32;
    });
    const values = [CODE128_START_B, ...data];
    return [...values, code128Checksum(values), CODE128_STOP];
}

/** Bar and space widths of the whole barcode, in modules (quiet zones not included). */
export function code128Widths(text: string): number[] {
    return code128Values(text).flatMap(symbolWidths);
}

/** SVG of the bars (one module = one unit wide), drawn with `color`, quiet zones of `quiet` modules. */
export function barcodeSvg(widths: readonly number[], height: number, color: string, quiet = 10): string {
    let x = quiet;
    let rects = '';
    widths.forEach((width, index) => {
        if (index % 2 === 0) rects += `<rect x="${x}" width="${width}" height="${height}"/>`;
        x += width;
    });
    const total = x + quiet;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${height}" preserveAspectRatio="none" shape-rendering="crispEdges"><g fill="${color}">${rects}</g></svg>`;
}
