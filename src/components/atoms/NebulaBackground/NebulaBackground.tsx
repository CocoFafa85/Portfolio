import React, { Suspense, lazy, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { nebulaEffects as fx } from '../../../data/effects';
import { useIdleReady } from '../../../hooks/useIdleReady';
import styles from './NebulaBackground.module.scss';

// Own chunk, fetched only once the page is idle (never in reduced motion)
const NebulaShader = lazy(() => import('./NebulaShader'));

type CssVars = CSSProperties & Record<`--${string}`, string>;
const VARS: CssVars = { '--nebula-fade-ms': `${fx.fadeInMs}ms` };

/**
 * Home background nebula (LOT 2, H4): a CSS gradient painted at once (and
 * kept in reduced motion), then the Paper Shaders mesh fading in over it.
 */
const NebulaBackground: React.FC = () => {
    const reducedMotion = useReducedMotion();
    const idle = useIdleReady(fx.idleTimeoutMs);

    return (
        <div className={styles.nebula} style={VARS} aria-hidden="true">
            {idle && !reducedMotion && (
                <Suspense fallback={null}>
                    <NebulaShader />
                </Suspense>
            )}
        </div>
    );
};

export default NebulaBackground;
