import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { content } from '../../../data/content';
import { navEffects } from '../../../data/effects';
import { formatNavIndex } from '../../../utils/format';
import styles from './HudNav.module.scss';

const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

/**
 * Site navigation bar "Ligne d'horizon" (LOT 1, C1). The home badge stands out,
 * the numbered links stay discreet and rest on a luminous line where the
 * active-page indicator glides (shared layout animation, skipped in reduced motion).
 * NavLink sets aria-current="page" on the active entry.
 */
const HudNav: React.FC = () => (
    <header className={styles.hud}>
        <NavLink to="/" end className={styles.home}>
            <span className={styles.emblem} aria-hidden="true">{content.ui.monogram}</span>
            <span className={styles.homeLabel}>{content.ui.homeLabel}</span>
        </NavLink>

        <nav className={styles.nav} aria-label={content.ui.mainNavLabel}>
            <ul className={styles.list}>
                {content.nav.map((item, index) => (
                    <li key={item.id}>
                        <NavLink to={item.path} className={linkClass}>
                            {({ isActive }) => (
                                <>
                                    <span className={styles.index} aria-hidden="true">
                                        {formatNavIndex(index)}
                                    </span>
                                    {item.label}
                                    {isActive && (
                                        <motion.span
                                            layoutId="hud-indicator"
                                            className={styles.indicator}
                                            transition={navEffects.indicator}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </header>
);

export default HudNav;
