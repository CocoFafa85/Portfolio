import React, { useRef, useEffect, useCallback, useState } from 'react';

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

interface CircuitNode {
    x: number;
    y: number;
    connections: number[]; // indices of connected nodes
    brightness: number;    // 0-1, boosted near mouse
    pulsePhase: number;    // phase offset for ambient pulsing
}

interface CircuitSegment {
    fromNode: number;
    toNode: number;
    waypoints: { x: number; y: number }[]; // intermediate right-angle points
    brightness: number;
}

interface DataPulse {
    segmentIndex: number;
    progress: number;     // 0-1 along the segment path
    speed: number;
    brightness: number;
    hue: number;          // 0=trace, 1=node, 2=pulse
    trail: number;        // length of trailing glow
}

// ═══════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════

const GRID_SPACING = 80;
const NODE_CHANCE = 0.35;          // probability a grid intersection becomes a node
const CONNECTION_MAX_DIST = 3;     // max grid cells for a connection
const MAX_PULSES = 25;
const PULSE_SPAWN_INTERVAL = 400;  // ms
const MOUSE_SCANNER_RADIUS = 70;   // Reduced from 200 (approx / 3)
const NODE_BASE_RADIUS = 2;
const NODE_GLOW_RADIUS = 12;

// Color palette — Holo-Motherboard
const COLORS = {
    trace: { r: 0, g: 255, b: 157 }, // #00ff9d Green Neon (Traces)
    node: { r: 255, g: 255, b: 255 }, // #ffffff White (Nodes)
    pulse: { r: 0, g: 188, b: 212 }, // #00bcd4 Cyan Tech (Pulses override)
};

const COLOR_ARRAY = [COLORS.trace, COLORS.node, COLORS.pulse];

// Layer config for depth effect (back → front)
const LAYERS = [
    { opacity: 0.08, scale: 0.6, speed: 0.3, lineWidth: 0.3 },
    { opacity: 0.2, scale: 0.8, speed: 0.6, lineWidth: 0.5 },
    { opacity: 0.45, scale: 1.0, speed: 1.0, lineWidth: 0.8 },
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════

function generateCircuitry(
    width: number,
    height: number,
    layerScale: number,
    isMobile: boolean
): { nodes: CircuitNode[]; segments: CircuitSegment[] } {
    // Reduce density on mobile by increasing spacing
    const baseSpacing = isMobile ? GRID_SPACING * 2 : GRID_SPACING;
    const spacing = baseSpacing / layerScale;

    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    const nodes: CircuitNode[] = [];
    const nodeGrid: (number | null)[][] = [];

    // Place nodes on grid intersections randomly
    for (let row = 0; row < rows; row++) {
        nodeGrid[row] = [];
        for (let col = 0; col < cols; col++) {
            if (Math.random() < NODE_CHANCE) {
                const nodeIndex = nodes.length;
                nodes.push({
                    x: col * spacing - spacing,
                    y: row * spacing - spacing,
                    connections: [],
                    brightness: 0,
                    pulsePhase: Math.random() * Math.PI * 2,
                });
                nodeGrid[row][col] = nodeIndex;
            } else {
                nodeGrid[row][col] = null;
            }
        }
    }

    const segments: CircuitSegment[] = [];

    // Connect nearby nodes with L-shaped or straight circuit traces
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const fromIdx = nodeGrid[row][col];
            if (fromIdx === null) continue;

            // Search in right and down directions to avoid duplicates
            for (let dr = 0; dr <= CONNECTION_MAX_DIST; dr++) {
                for (let dc = (dr === 0 ? 1 : -CONNECTION_MAX_DIST); dc <= CONNECTION_MAX_DIST; dc++) {
                    const tr = row + dr;
                    const tc = col + dc;
                    if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) continue;
                    if (tr === row && tc === col) continue;

                    const toIdx = nodeGrid[tr][tc];
                    if (toIdx === null) continue;

                    // Limit connections per node
                    if (nodes[fromIdx].connections.length >= 3) continue;
                    if (nodes[toIdx].connections.length >= 3) continue;

                    // Random filtering to keep it sparse
                    if (Math.random() > 0.3) continue;

                    nodes[fromIdx].connections.push(toIdx);
                    nodes[toIdx].connections.push(fromIdx);

                    const from = nodes[fromIdx];
                    const to = nodes[toIdx];

                    // Create L-shaped waypoints (circuit board style: horizontal then vertical)
                    const waypoints: { x: number; y: number }[] = [];
                    if (Math.abs(from.x - to.x) > 1 && Math.abs(from.y - to.y) > 1) {
                        if (Math.random() > 0.5) {
                            waypoints.push({ x: to.x, y: from.y });
                        } else {
                            waypoints.push({ x: from.x, y: to.y });
                        }
                    }

                    segments.push({
                        fromNode: fromIdx,
                        toNode: toIdx,
                        waypoints,
                        brightness: 0,
                    });
                }
            }
        }
    }

    return { nodes, segments };
}

function getSegmentPath(
    segment: CircuitSegment,
    nodes: CircuitNode[]
): { x: number; y: number }[] {
    const from = nodes[segment.fromNode];
    const to = nodes[segment.toNode];
    return [
        { x: from.x, y: from.y },
        ...segment.waypoints,
        { x: to.x, y: to.y },
    ];
}

function getPointOnPath(
    path: { x: number; y: number }[],
    t: number
): { x: number; y: number } {
    if (path.length < 2) return path[0];

    // Calculate total length
    let totalLength = 0;
    const segLengths: number[] = [];
    for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segLengths.push(len);
        totalLength += len;
    }

    if (totalLength === 0) return path[0];

    const targetDist = t * totalLength;
    let accumulated = 0;

    for (let i = 0; i < segLengths.length; i++) {
        if (accumulated + segLengths[i] >= targetDist) {
            const localT = (targetDist - accumulated) / segLengths[i];
            return {
                x: path[i].x + (path[i + 1].x - path[i].x) * localT,
                y: path[i].y + (path[i + 1].y - path[i].y) * localT,
            };
        }
        accumulated += segLengths[i];
    }

    return path[path.length - 1];
}

// ═══════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════

const CyberpunkBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const rafRef = useRef<number>(0);
    const layersRef = useRef<{
        nodes: CircuitNode[];
        segments: CircuitSegment[];
        pulses: DataPulse[];
    }[]>([]);
    const lastPulseSpawnRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 769);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const initLayers = useCallback((width: number, height: number, mobile: boolean) => {
        layersRef.current = LAYERS.map((layerConfig) => {
            const { nodes, segments } = generateCircuitry(
                width,
                height,
                layerConfig.scale,
                mobile
            );
            return { nodes, segments, pulses: [] };
        });
    }, []);

    useEffect(() => {
        // Removed: if (isMobile) return; --> Now we render on mobile too

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reduced motion: a single static frame, the loop resumes if the setting changes.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initLayers(canvas.width, canvas.height, window.innerWidth < 769);
            if (reducedMotion.matches) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        const handleReducedMotionChange = () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        const animate = (timestamp: number) => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const mouse = mouseRef.current;
            const layers = layersRef.current;

            // Spawn new pulses periodically
            if (timestamp - lastPulseSpawnRef.current > PULSE_SPAWN_INTERVAL) {
                lastPulseSpawnRef.current = timestamp;

                for (let li = 0; li < layers.length; li++) {
                    const layer = layers[li];
                    if (layer.pulses.length < MAX_PULSES && layer.segments.length > 0) {
                        const segIdx = Math.floor(Math.random() * layer.segments.length);
                        layer.pulses.push({
                            segmentIndex: segIdx,
                            progress: 0,
                            speed: (0.002 + Math.random() * 0.004) * LAYERS[li].speed,
                            brightness: 0.7 + Math.random() * 0.3,
                            hue: Math.floor(Math.random() * 3), // 0-2 index in COLOR_ARRAY
                            trail: 0.08 + Math.random() * 0.12,
                        });
                    }
                }
            }

            // ═══ Render each layer ═══
            for (let li = 0; li < layers.length; li++) {
                const layer = layers[li];
                const config = LAYERS[li];

                // ─── Draw circuit segments ───
                for (const segment of layer.segments) {
                    const path = getSegmentPath(segment, layer.nodes);

                    // Check mouse proximity for brightness boost
                    let maxProximity = 0;
                    for (const pt of path) {
                        const dx = mouse.x - pt.x;
                        const dy = mouse.y - pt.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < MOUSE_SCANNER_RADIUS) {
                            const prox = 1 - dist / MOUSE_SCANNER_RADIUS;
                            if (prox > maxProximity) maxProximity = prox;
                        }
                    }

                    // Smooth brightness transition
                    segment.brightness += (maxProximity - segment.brightness) * 0.08;

                    const alpha = (config.opacity + segment.brightness * 0.4) * 0.6;
                    const color = COLORS.trace; // Main trace color

                    ctx.beginPath();
                    ctx.moveTo(path[0].x, path[0].y);
                    for (let i = 1; i < path.length; i++) {
                        ctx.lineTo(path[i].x, path[i].y);
                    }
                    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                    ctx.lineWidth = config.lineWidth + segment.brightness * 1.2;
                    ctx.stroke();

                    // Boosted glow line on hover
                    if (segment.brightness > 0.1) {
                        ctx.beginPath();
                        ctx.moveTo(path[0].x, path[0].y);
                        for (let i = 1; i < path.length; i++) {
                            ctx.lineTo(path[i].x, path[i].y);
                        }
                        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${segment.brightness * 0.15})`;
                        ctx.lineWidth = config.lineWidth + segment.brightness * 4;
                        ctx.stroke();
                    }
                }

                // ─── Draw junction nodes ───
                for (const node of layer.nodes) {
                    const dx = mouse.x - node.x;
                    const dy = mouse.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const mouseProximity = dist < MOUSE_SCANNER_RADIUS
                        ? 1 - dist / MOUSE_SCANNER_RADIUS
                        : 0;

                    // Smooth brightness transition
                    node.brightness += (mouseProximity - node.brightness) * 0.06;

                    // Ambient pulsing
                    const ambientPulse = 0.3 + Math.sin(timestamp * 0.001 + node.pulsePhase) * 0.15;
                    const totalBrightness = ambientPulse + node.brightness * 0.7;

                    const alpha = config.opacity * totalBrightness;
                    const radius = NODE_BASE_RADIUS + node.brightness * 2;

                    // Outer glow for bright nodes
                    if (node.brightness > 0.15 || node.connections.length > 1) {
                        const glowColor = node.connections.length > 1 ? COLORS.pulse : COLORS.trace;
                        const glowRadius = NODE_GLOW_RADIUS * (0.5 + node.brightness);
                        const gradient = ctx.createRadialGradient(
                            node.x, node.y, 0,
                            node.x, node.y, glowRadius
                        );
                        gradient.addColorStop(0, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${alpha * 0.5})`);
                        gradient.addColorStop(1, `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, 0)`);
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }

                    // Node core
                    const coreColor = COLORS.node; // White nodes
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${coreColor.r}, ${coreColor.g}, ${coreColor.b}, ${alpha})`;
                    ctx.fill();

                    // Bright white center on active nodes
                    if (node.brightness > 0.3) {
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, radius * 0.4, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${node.brightness * 0.6})`;
                        ctx.fill();
                    }
                }

                // ─── Update & draw data pulses ───
                const activePulses: DataPulse[] = [];
                for (const pulse of layer.pulses) {
                    pulse.progress += pulse.speed;

                    if (pulse.progress > 1 + pulse.trail) {
                        continue; // pulse finished
                    }

                    activePulses.push(pulse);

                    const segment = layer.segments[pulse.segmentIndex];
                    if (!segment) continue;

                    const path = getSegmentPath(segment, layer.nodes);
                    const color = COLOR_ARRAY[pulse.hue];

                    // Draw pulse trail
                    const trailSteps = 8;
                    for (let t = 0; t < trailSteps; t++) {
                        const trailT = pulse.progress - (t / trailSteps) * pulse.trail;
                        if (trailT < 0 || trailT > 1) continue;

                        const pt = getPointOnPath(path, trailT);
                        const trailAlpha = (1 - t / trailSteps) * pulse.brightness * config.opacity * 2;
                        const trailSize = (1 - t / trailSteps) * 3 + 1;

                        // Glow
                        const gradient = ctx.createRadialGradient(
                            pt.x, pt.y, 0,
                            pt.x, pt.y, trailSize * 3
                        );
                        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${trailAlpha})`);
                        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${trailAlpha * 0.3})`);
                        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, trailSize * 3, 0, Math.PI * 2);
                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }

                    // Pulse head — bright white core
                    if (pulse.progress >= 0 && pulse.progress <= 1) {
                        const headPt = getPointOnPath(path, pulse.progress);
                        ctx.beginPath();
                        ctx.arc(headPt.x, headPt.y, 2.5, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${pulse.brightness * 0.9})`;
                        ctx.fill();
                    }
                }
                layer.pulses = activePulses;
            }

            // ═══ Mouse scanner ring ═══
            if (mouse.x > -9000) {
                // Outer scanner circle
                const scannerAlpha = 0.12 + Math.sin(timestamp * 0.003) * 0.04;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, MOUSE_SCANNER_RADIUS, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${COLORS.trace.r}, ${COLORS.trace.g}, ${COLORS.trace.b}, ${scannerAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Inner radial glow
                const scanGradient = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, MOUSE_SCANNER_RADIUS
                );
                scanGradient.addColorStop(0, `rgba(${COLORS.trace.r}, ${COLORS.trace.g}, ${COLORS.trace.b}, 0.06)`);
                scanGradient.addColorStop(0.5, `rgba(${COLORS.pulse.r}, ${COLORS.pulse.g}, ${COLORS.pulse.b}, 0.03)`);
                scanGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, MOUSE_SCANNER_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = scanGradient;
                ctx.fill();

                // Rotating scanner arcs
                const angle = timestamp * 0.001;
                for (let i = 0; i < 3; i++) {
                    const arcAngle = angle + (i * Math.PI * 2) / 3;
                    ctx.beginPath();
                    ctx.arc(
                        mouse.x,
                        mouse.y,
                        MOUSE_SCANNER_RADIUS * 0.7,
                        arcAngle,
                        arcAngle + 0.4
                    );
                    ctx.strokeStyle = `rgba(${COLORS.trace.r}, ${COLORS.trace.g}, ${COLORS.trace.b}, ${0.15 - i * 0.03})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (!reducedMotion.matches) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        reducedMotion.addEventListener('change', handleReducedMotionChange);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            reducedMotion.removeEventListener('change', handleReducedMotionChange);
            cancelAnimationFrame(rafRef.current);
        };
    }, [isMobile, initLayers]);

    // Don't render on mobile - REMOVED! we render canvas now
    // if (isMobile) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
};

export default CyberpunkBackground;
