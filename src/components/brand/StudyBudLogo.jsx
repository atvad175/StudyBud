import React from 'react';
import styles from './StudyBudLogo.module.css';

const sizeClass = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    hero: styles.sizeHero,
};

/**
 * Brand mark: a sprout growing out of an open book.
 *
 * Deliberately simple — three solid shapes plus a stem — so it still reads at
 * 18px in a browser tab and never turns to mush in the sidebar.
 */
export const BudMark = ({ className = '' }) => (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
        <path d="M16 9.6c.2-3.7 2.7-6.3 6.6-6.3 0 3.7-2.6 6.3-6.6 6.3Z" fill="currentColor" />
        <rect x="15.3" y="6.6" width="1.4" height="6" rx="0.7" fill="currentColor" />
        <path d="M3.8 12.2c4-1.9 8.6-1.8 11.3 0V26c-2.7-1.7-7.3-1.8-11.3.1Z" fill="currentColor" />
        <path d="M28.2 12.2c-4-1.9-8.6-1.8-11.3 0V26c2.7-1.7 7.3-1.8 11.3.1Z" fill="currentColor" />
    </svg>
);

/**
 * Brand lockup: gold circle + bud mark + StudyBud wordmark.
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
                <BudMark className={styles.glyph} />
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
