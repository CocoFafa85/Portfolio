import React from 'react';
import { motion, useIsPresent, usePresenceData, useReducedMotion } from 'motion/react';
import { isTravelStyle } from '../../utils/travel';
import { pageFadeVariants, pageTravelVariants } from './pageTravelVariants';
import styles from './MainLayout.module.scss';

export interface PageTravelProps {
    children: React.ReactNode;
}

/**
 * Page wrapper inside AnimatePresence: reads the trip style the layout passes
 * as presence data (consumer of the trip channel) and plays the matching
 * motion. A leaving page is `inert`: keyboard focus can never land on it.
 */
const PageTravel: React.FC<PageTravelProps> = ({ children }) => {
    const data: unknown = usePresenceData();
    const style = isTravelStyle(data) ? data : 'none';
    const isPresent = useIsPresent();
    const reducedMotion = useReducedMotion();

    return (
        <motion.div
            className={styles.page}
            custom={style}
            variants={reducedMotion ? pageFadeVariants : pageTravelVariants}
            initial="arrive"
            animate="present"
            exit="leave"
            inert={!isPresent}
        >
            {children}
        </motion.div>
    );
};

export default PageTravel;
