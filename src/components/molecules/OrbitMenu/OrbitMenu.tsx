import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Code, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import { content } from '../../../data/content';
import { NavItem } from '../../../types/models';
import styles from './OrbitMenu.module.scss';

// Icons are visual only: labels and paths come from content.nav
const navIcons: Record<NavItem['id'], React.ReactNode> = {
    about: <User size={24} aria-hidden="true" />,
    skills: <Code size={24} aria-hidden="true" />,
    projects: <Briefcase size={24} aria-hidden="true" />,
};

const navItems = content.nav;

const OrbitMenu: React.FC = () => {
    // Helper to calculate position on a circle
    const getPosition = (index: number, total: number, radius: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start at top (-90deg)
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return { x, y };
    };

    return (
        <nav className={styles.orbitContainer} aria-label={content.ui.mainNavLabel}>
            <div className={styles.stargateRing} />
            {navItems.map((item, index) => {
                const { x, y } = getPosition(index, navItems.length, 200); // 200px radius
                return (
                    <div
                        key={item.id}
                        className={styles.orbitItem}
                        style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`
                        }}
                    >
                        <NavLink
                            to={item.path}
                            className={styles.orbitButton}
                        >
                            <motion.div
                                whileHover={{ rotate: 15 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                {navIcons[item.id]}
                                <span>{item.label}</span>
                            </motion.div>
                        </NavLink>
                    </div>
                );
            })}
        </nav>
    );
};

export default OrbitMenu;
