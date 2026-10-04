import React from 'react';
import NebulaBackground from '../../components/atoms/NebulaBackground/NebulaBackground';
import StarField from '../../components/atoms/StarField/StarField';
import Hero from '../../components/organisms/Hero/Hero';
import StargateMenu from '../../components/organisms/StargateMenu/StargateMenu';
import { content } from '../../data/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import styles from './Home.module.scss';

/**
 * Home page (LOT 2): nebula and starfield behind, the decoded title and
 * roles on top, the particle stargate (the orbital menu) in the space left
 * below. Fluid sizes in CSS, the gate fits its own cell.
 */
const Home: React.FC = () => {
    usePageMeta('home');

    return (
        <div className={styles.home}>
            <NebulaBackground />
            <StarField />
            <Hero
                title={content.home.title}
                roles={content.home.roles}
                rolesSeparator={content.home.rolesSeparator}
            />
            <StargateMenu />
        </div>
    );
};

export default Home;
