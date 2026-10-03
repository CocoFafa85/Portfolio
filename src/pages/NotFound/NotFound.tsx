import React from 'react';
import { Link } from 'react-router-dom';
import { content } from '../../data/content';
import styles from './NotFound.module.scss';

const labels = content.notFound;

const NotFound: React.FC = () => {
    return (
        <section className={styles.notFoundPage}>
            <div className={styles.panel}>
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
