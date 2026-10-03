import React, { useRef, useEffect, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    hue: number; // 0=cyan, 1=violet, 2=pink
}

interface Meteor {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    trail: { x: number; y: number; alpha: number }[];
    active: boolean;
    spawnTimer: number;
}

const PARTICLE_COUNT = 80;
const CONNECTION_DISTANCE = 130;
const MOUSE_RADIUS = 220;
const BASE_SPEED = 0.25;
const METEOR_FORCE_RADIUS = 180;
const METEOR_FORCE_STRENGTH = 2.5;
const METEOR_SPAWN_INTERVAL = 6000; // ms between meteors
const METEOR_SPEED = 3;
const METEOR_TRAIL_LENGTH = 25;

// Color palette: Cyan → Violet → Pink
const COLORS = [
    { r: 0, g: 243, b: 255 },   // Cyan  #00f3ff
    { r: 188, g: 19, b: 254 },  // Violet #bc13fe
    { r: 255, g: 0, b: 128 },   // Pink  #ff0080
];

const QuantumField: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const meteorRef = useRef<Meteor>({
        x: -200, y: -200,
        vx: 0, vy: 0,
        radius: 5,
        trail: [],
        active: false,
        spawnTimer: 0,
    });
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef(0);

    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * BASE_SPEED,
                vy: (Math.random() - 0.5) * BASE_SPEED,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.floor(Math.random() * 3),
            });
        }
        particlesRef.current = particles;
    }, []);

    const spawnMeteor = useCallback((width: number, height: number) => {
        const meteor = meteorRef.current;

        // Random entry edge: 0=top, 1=right, 2=bottom, 3=left
        // Bias towards top-left → bottom-right diagonal
        const rand = Math.random();
        let startX: number, startY: number;
        let angle: number;

        if (rand < 0.4) {
            // From top edge
            startX = Math.random() * width * 0.6;
            startY = -20;
            angle = Math.PI * (0.2 + Math.random() * 0.3); // ~35-90° downward
        } else if (rand < 0.7) {
            // From left edge
            startX = -20;
            startY = Math.random() * height * 0.5;
            angle = Math.PI * (-0.1 + Math.random() * 0.3); // ~-18° to 54° rightward
        } else {
            // From top-left corner area
            startX = -20 + Math.random() * width * 0.3;
            startY = -20;
            angle = Math.PI * 0.25 + (Math.random() - 0.5) * 0.3; // ~diagonal
        }

        meteor.x = startX;
        meteor.y = startY;
        meteor.vx = Math.cos(angle) * METEOR_SPEED;
        meteor.vy = Math.sin(angle) * METEOR_SPEED;
        meteor.radius = 4 + Math.random() * 3;
        meteor.trail = [];
        meteor.active = true;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reduced motion: a single static frame, the loop resumes if the setting changes.
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            if (particlesRef.current.length === 0) {
                initParticles(canvas.width, canvas.height);
            }
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
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        const animate = (timestamp: number) => {
            const dt = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            const mouse = mouseRef.current;
            const meteor = meteorRef.current;
            const particles = particlesRef.current;

            // ═══ Meteor spawn logic ═══
            meteor.spawnTimer += dt;
            if (!meteor.active && meteor.spawnTimer >= METEOR_SPAWN_INTERVAL) {
                spawnMeteor(width, height);
                meteor.spawnTimer = 0;
            }

            // ═══ Update & draw meteor ═══
            if (meteor.active) {
                meteor.x += meteor.vx;
                meteor.y += meteor.vy;

                // Add trail point
                meteor.trail.unshift({ x: meteor.x, y: meteor.y, alpha: 1 });
                if (meteor.trail.length > METEOR_TRAIL_LENGTH) {
                    meteor.trail.pop();
                }

                // Fade trail
                for (let t = 0; t < meteor.trail.length; t++) {
                    meteor.trail[t].alpha = 1 - t / METEOR_TRAIL_LENGTH;
                }

                // ═══ Apply turbulence force to nearby particles ═══
                for (const p of particles) {
                    const dx = p.x - meteor.x;
                    const dy = p.y - meteor.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < METEOR_FORCE_RADIUS && dist > 1) {
                        const force = (1 - dist / METEOR_FORCE_RADIUS) * METEOR_FORCE_STRENGTH;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Repulsion + slight tangential swirl
                        p.vx += (nx * force + ny * force * 0.3) * 0.05;
                        p.vy += (ny * force - nx * force * 0.3) * 0.05;
                    }
                }

                // Draw meteor trail
                for (let t = meteor.trail.length - 1; t >= 0; t--) {
                    const tp = meteor.trail[t];
                    const trailRadius = meteor.radius * (1 - t / METEOR_TRAIL_LENGTH) * 0.8;
                    const gradient = ctx.createRadialGradient(
                        tp.x, tp.y, 0,
                        tp.x, tp.y, trailRadius + 4
                    );
                    gradient.addColorStop(0, `rgba(188, 19, 254, ${tp.alpha * 0.4})`);
                    gradient.addColorStop(1, `rgba(0, 243, 255, 0)`);
                    ctx.beginPath();
                    ctx.arc(tp.x, tp.y, trailRadius + 4, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // Draw meteor head
                const headGlow = ctx.createRadialGradient(
                    meteor.x, meteor.y, 0,
                    meteor.x, meteor.y, meteor.radius * 4
                );
                headGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                headGlow.addColorStop(0.2, 'rgba(0, 243, 255, 0.6)');
                headGlow.addColorStop(0.5, 'rgba(188, 19, 254, 0.3)');
                headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, meteor.radius * 4, 0, Math.PI * 2);
                ctx.fillStyle = headGlow;
                ctx.fill();

                // Bright core
                ctx.beginPath();
                ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                ctx.fill();

                // Deactivate when off-screen
                if (meteor.x > width + 100 || meteor.y > height + 100 ||
                    meteor.x < -200 || meteor.y < -200) {
                    meteor.active = false;
                    meteor.spawnTimer = 0;
                }
            }

            // ═══ Draw mouse halo ═══
            if (mouse.x > -9000) {
                const gradient = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, MOUSE_RADIUS
                );
                gradient.addColorStop(0, 'rgba(188, 19, 254, 0.08)');
                gradient.addColorStop(0.4, 'rgba(0, 243, 255, 0.04)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(
                    mouse.x - MOUSE_RADIUS,
                    mouse.y - MOUSE_RADIUS,
                    MOUSE_RADIUS * 2,
                    MOUSE_RADIUS * 2
                );
            }

            // ═══ Update & draw particles ═══
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;

                // Dampen velocities back towards base speed (recover from meteor turbulence)
                p.vx *= 0.995;
                p.vy *= 0.995;

                // Re-add base drift if velocity gets too low
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed < BASE_SPEED * 0.3) {
                    p.vx += (Math.random() - 0.5) * BASE_SPEED * 0.1;
                    p.vy += (Math.random() - 0.5) * BASE_SPEED * 0.1;
                }

                // Wrap around edges
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                // Mouse proximity — glow boost
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const glow = dist < MOUSE_RADIUS ? 1 - dist / MOUSE_RADIUS : 0;

                const alpha = p.opacity + glow * 0.6;
                const color = COLORS[p.hue];

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius + glow * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
                ctx.fill();

                // Subtle white core for bright particles near cursor
                if (glow > 0.3) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.5})`;
                    ctx.fill();
                }
            }

            // ═══ Draw connections ═══
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const midX = (a.x + b.x) / 2;
                        const midY = (a.y + b.y) / 2;
                        const mouseDist = Math.sqrt(
                            (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
                        );

                        if (mouseDist < MOUSE_RADIUS * 1.5) {
                            const lineAlpha =
                                (1 - dist / CONNECTION_DISTANCE) *
                                (1 - mouseDist / (MOUSE_RADIUS * 1.5)) *
                                0.35;

                            const c = COLORS[a.hue];
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${lineAlpha})`;
                            ctx.lineWidth = 0.6;
                            ctx.stroke();
                        }
                    }
                }
            }

            if (!reducedMotion.matches) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        resize();
        window.addEventListener('resize', resize);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        reducedMotion.addEventListener('change', handleReducedMotionChange);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            reducedMotion.removeEventListener('change', handleReducedMotionChange);
            cancelAnimationFrame(rafRef.current);
        };
    }, [initParticles, spawnMeteor]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'auto',
            }}
        />
    );
};

export default QuantumField;
