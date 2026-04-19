import React from 'react';
import { Brain } from 'lucide-react';
import styles from './StudyBudLogo.module.css';

const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    hero: styles.sizeHero,
};

/**
 * Brand mark: gold circle + brain icon + StudyBud wordmark.
 * @param {'onLight'|'onDark'} variant — text colours for background
 * @param {'sm'|'md'|'lg'|'hero'} size
 */
const StudyBudLogo = ({
    variant = 'onLight',
    size = 'md',
    stacked = false,
    showTagline = false,
    tagline = 'Your quiet space',
    className = '',
    onClick,
}) => {
    const variantCls = variant === 'onDark' ? styles.onDark : styles.onLight;
    const rootClass = [
        styles.root,
        variantCls,
        sizeClass[size] || styles.sizeMd,
        stacked ? styles.stacked : '',
        onClick ? styles.clickable : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const inner = (
        <>
            <div className={styles.mark} aria-hidden>
                <Brain className={styles.brain} strokeWidth={1.85} />
            </div>
            <div className={styles.wordmark}>
                <span>
                    <span className={styles.study}>Study</span>
                    <span className={styles.bud}>Bud</span>
                </span>
                {showTagline && <span className={styles.tagline}>{tagline}</span>}
            </div>
        </>
    );

    if (onClick) {
        return (
            <button type="button" className={rootClass} onClick={onClick}>
                {inner}
            </button>
        );
    }

    return <div className={rootClass}>{inner}</div>;
};

export default StudyBudLogo;
