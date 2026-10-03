import React from 'react';
import styles from './Home.module.scss';
import Hero from '../../components/organisms/Hero/Hero';
import OrbitMenu from '../../components/molecules/OrbitMenu/OrbitMenu';
import QuantumField from '../../components/atoms/QuantumField/QuantumField';
import { content } from '../../data/content';
import { motion } from 'motion/react';
import { usePageMeta } from '../../hooks/usePageMeta';

const Home: React.FC = () => {
    usePageMeta('home');
    const [scale, setScale] = React.useState(1);

    React.useEffect(() => {
        const handleResize = () => {
            const targetWidth = 1000;
            const currentRatio = window.innerWidth / targetWidth;
            setScale(Math.max(0.7, Math.min(currentRatio, 1)));
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.homeWrapper}
        >
            <QuantumField />
            <div
                className={styles.scalableContent}
                style={{ transform: `scale(${scale})` }}
            >
                <Hero
                    title={content.home.title}
                    subtitle={content.home.subtitle}
                />
                <OrbitMenu />
            </div>
        </motion.div>
    );
};

export default Home;
