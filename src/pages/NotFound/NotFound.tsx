import React from 'react';
import { Link } from 'react-router-dom';
import NeonFrame from '../../components/atoms/NeonFrame/NeonFrame';
import { content } from '../../data/content';
import styles from './NotFound.module.scss';
import { usePageMeta } from '../../hooks/usePageMeta';

const labels = content.notFound;

const NotFound: React.FC = () => {
    usePageMeta('notFound');
    return (
        <section className={styles.notFoundPage}>
            <div className={styles.panel}>
                <NeonFrame />
                <p className={styles.code}>{labels.code}</p>
                <h1 className="glitch-title" data-text={labels.title}>
                    {labels.title}
                </h1>
                <p className={styles.message}>{labels.message}</p>
                <Link to="/" className={styles.homeLink}>
                    {labels.cta}
                </Link>
            </div>
        </section>
    );
};

export default NotFound;
