import React, { Suspense } from 'react';
import { motion, useIsPresent, usePresenceData, useReducedMotion } from 'motion/react';
import { isTravelStyle } from '../../utils/travel';
import { ArrivalContext } from './arrival';
import { pageFadeVariants, pageTravelVariants } from './pageTravelVariants';
import styles from './MainLayout.module.scss';

export interface PageTravelProps {
    children: React.ReactNode;
}

/**
 * Page wrapper inside AnimatePresence: reads the trip style the layout passes
 * as presence data (consumer of the trip channel) and plays the matching
 * motion; passes that trip on to the page (ArrivalContext). A leaving page
 * is `inert`: keyboard focus can never land on it.
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
            <ArrivalContext.Provider value={style}>
                {/* An inner page in its own chunk (LOT 4, A0): the trip holds its cover until the chunk is in,
                    so this empty fallback only shows on a direct load before the preloaded chunk runs */}
                <Suspense fallback={null}>{children}</Suspense>
            </ArrivalContext.Provider>
        </motion.div>
    );
};

export default PageTravel;
