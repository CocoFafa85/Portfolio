import React, { useState } from 'react';
import NebulaBackground from '../../components/atoms/NebulaBackground/NebulaBackground';
import StarField from '../../components/atoms/StarField/StarField';
import Hero from '../../components/organisms/Hero/Hero';
import StargateMenu from '../../components/organisms/StargateMenu/StargateMenu';
import { content } from '../../data/content';
import { usePageMeta } from '../../hooks/usePageMeta';
import { createGateOccluder } from '../../utils/stargate/occluder';
import styles from './Home.module.scss';

/**
 * Home page (LOT 2): nebula and starfield behind, the decoded title and
 * roles on top, the particle stargate (the orbital menu) in the space left
 * below. Fluid sizes in CSS, the gate fits its own cell. The gate stands in
 * front of the sky: it tells the starfield the disc it covers (occluder).
 */
const Home: React.FC = () => {
    usePageMeta('home');
    const [occluder] = useState(createGateOccluder);

    return (
        <div className={styles.home}>
            <NebulaBackground />
            <StarField occluder={occluder} />
            <Hero
                title={content.home.title}
                roles={content.home.roles}
                rolesSeparator={content.home.rolesSeparator}
            />
            <StargateMenu occluder={occluder} />
        </div>
    );
};

export default Home;
