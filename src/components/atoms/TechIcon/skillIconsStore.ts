import { createContext, useContext, useEffect, useState, type RefObject } from 'react';
import { skillEffects as fx } from '../../../data/effects';
import { onIdleAfter } from '../../../hooks/useIdleReady';
import type { SkillIcon } from '../../../types/models';

export type SkillIconMap = Record<string, SkillIcon>;

let loaded: SkillIconMap | null = null;
let pending: Promise<SkillIconMap> | null = null;

const loadIcons = () => (pending ??= import('../../../data/generated/skillIcons').then((module) => (loaded = module.skillIcons)));

/**
 * The Simple Icons paths (~27 kB gzip) live in their own chunk (LOT 4, S3):
 * bundled with the page, they delayed its first paint (LCP 2.3 → 2.5 s on
 * a simulated phone). Requested when the badges come near the screen, at the
 * next idle moment (never during the page load on a phone, where the card
 * fills the first screen); the badges keep an empty slot of the icon's size
 * until then.
 */
export function useSkillIcons(badgesRef: RefObject<Element | null>): SkillIconMap | null {
    const [icons, setIcons] = useState<SkillIconMap | null>(loaded);
    useEffect(() => {
        if (loaded) return undefined;
        let alive = true;
        let cancel = () => {};
        const observer = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            cancel = onIdleAfter(fx.iconsAfterMs, fx.iconsTimeoutMs, () => {
                loadIcons().then((map) => { if (alive) setIcons(map); }, () => undefined);
            });
        }, { rootMargin: fx.iconsMargin });
        if (badgesRef.current) observer.observe(badgesRef.current);
        return () => { alive = false; observer.disconnect(); cancel(); };
    }, [badgesRef]);
    return icons;
}

/** Icons once loaded (provided by SkillSections, read by TechIcon) */
export const SkillIconsContext = createContext<SkillIconMap | null>(null);

export const useSkillIconMap = () => useContext(SkillIconsContext);
