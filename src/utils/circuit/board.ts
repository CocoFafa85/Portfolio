import type { CircuitDesignators } from '../../types/models';
import type { Random } from '../random';
import { addChip, addEdgeBus, addPart, type Builder } from './components';
import type { CalmBand } from './density';
import { polylineLength } from './geometry';

export type Range = readonly [number, number];

/** Generation settings of a printed circuit board (values in CSS pixels). */
export interface BoardConfig {
    /** Spacing of chip pins and of parallel traces */
    pitch: number;
    pinLength: number;
    /** Free space kept around every component */
    margin: number;
    /** Probability that a pin or pad gets a trace */
    keepPin: number;
    chipsPerMegapixel: number;
    minChips: number;
    partsPerMegapixel: number;
    edgeBusesPerMegapixel: number;
    /** Calm vertical band in the middle of the screen, behind the text blocks */
    calm: CalmBand;
    qfpShare: number;
    qfpSize: Range;
    soicWidth: Range;
    soicHeight: Range;
    lead: Range;
    diagonal: Range;
    tail: Range;
    /** Two-pad passive component (resistor, capacitor): long side */
    partSize: number;
    partLead: Range;
    partDiagonal: Range;
    busTraces: Range;
    busReach: Range;
}

export interface Chip {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
}

export interface Part {
    x: number;
    y: number;
    vertical: boolean;
    label: string;
}

/** A generated board, packed in typed arrays for allocation-free rendering. */
export interface Board {
    width: number;
    height: number;
    /** x,y pairs of every trace, concatenated */
    points: Float32Array;
    /** Trace i spans points [traceStart[i], traceStart[i + 1]) */
    traceStart: Uint32Array;
    traceLength: Float32Array;
    traceCount: number;
    /** x,y of every via (one at the end of each trace) */
    vias: Float32Array;
    /** x0,y0,x1,y1 of every chip lead */
    pins: Float32Array;
    chips: Chip[];
    parts: Part[];
    partSize: number;
}

/**
 * Generates a realistic board for a screen: chips (QFP, SOIC) fanning out
 * buses of parallel traces with 45° bends, passives, buses entering from the
 * edges, a via at the end of every trace. Deterministic for a given `random`.
 */
export function generateBoard(
    width: number,
    height: number,
    cfg: BoardConfig,
    designators: CircuitDesignators,
    random: Random
): Board {
    const b: Builder = {
        width, height, cfg, random,
        points: [], starts: [], vias: [], pins: [], boxes: [], chips: [], parts: [],
    };
    const megapixels = (width * height) / 1e6;

    const chipCount = Math.max(cfg.minChips, Math.round(megapixels * cfg.chipsPerMegapixel));
    for (let i = 1; i <= chipCount; i++) addChip(b, `${designators.chip}${i}`);

    let resistor = 1 + Math.floor(random() * 20);
    let capacitor = 1 + Math.floor(random() * 20);
    const partCount = Math.round(megapixels * cfg.partsPerMegapixel);
    for (let i = 0; i < partCount; i++) {
        const label = random() < 0.6
            ? `${designators.resistor}${resistor++}`
            : `${designators.capacitor}${capacitor++}`;
        addPart(b, label);
    }

    const busCount = Math.max(1, Math.round(megapixels * cfg.edgeBusesPerMegapixel));
    for (let i = 0; i < busCount; i++) addEdgeBus(b);

    return pack(b);
}

function pack(b: Builder): Board {
    const traceCount = b.starts.length;
    const points = Float32Array.from(b.points);
    const traceStart = new Uint32Array(traceCount + 1);
    traceStart.set(b.starts);
    traceStart[traceCount] = points.length / 2;
    const traceLength = new Float32Array(traceCount);
    for (let i = 0; i < traceCount; i++) {
        traceLength[i] = polylineLength(points, traceStart[i], traceStart[i + 1]);
    }
    return {
        width: b.width,
        height: b.height,
        points,
        traceStart,
        traceLength,
        traceCount,
        vias: Float32Array.from(b.vias),
        pins: Float32Array.from(b.pins),
        chips: b.chips,
        parts: b.parts,
        partSize: b.cfg.partSize,
    };
}
