import React from 'react';
import styles from './Home.module.scss';
import Hero from '../../components/organisms/Hero/Hero';
import OrbitMenu from '../../components/molecules/OrbitMenu/OrbitMenu';
import QuantumField from '../../components/atoms/QuantumField/QuantumField';
import { content } from '../../data/content';
import { motion } from 'motion/react';

const Home: React.FC = () => {
    const [scale, setScale] = React.useState(1);
    const requestRef = React.useRef<number | undefined>(undefined);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (requestRef.current) return;
            requestRef.current = requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth) - 0.5; // -0.5 to 0.5
                const y = (e.clientY / window.innerHeight) - 0.5;

                document.documentElement.style.setProperty('--mouse-x', x.toString());
                document.documentElement.style.setProperty('--mouse-y', y.toString());
                requestRef.current = undefined;
            });
        };

        const handleResize = () => {
            const targetWidth = 1000;
            const currentRatio = window.innerWidth / targetWidth;
            setScale(Math.max(0.7, Math.min(currentRatio, 1)));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
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
