import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { User, Code, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './OrbitMenu.module.scss';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { label: 'About', path: '/about', icon: <User size={24} /> },
    { label: 'Skills', path: '/skills', icon: <Code size={24} /> },
    { label: 'Projects', path: '/projects', icon: <Briefcase size={24} /> },
];

const OrbitMenu: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper to calculate position on a circle
    const getPosition = (index: number, total: number, radius: number) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start at top (-90deg)
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return { x, y };
    };

    return (
        <div className={styles.orbitContainer}>
            <div className={styles.stargateRing} />
            {navItems.map((item, index) => {
                const { x, y } = getPosition(index, navItems.length, 200); // 200px radius
                return (
                    <div
                        key={item.label}
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
                                {item.icon}
                                <span>{item.label}</span>
                            </motion.div>
                        </NavLink>
                    </div>
                );
            })}
        </div>
    );
};

export default OrbitMenu;
