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
        <path d="M15.9 10.4c0-4 2.4-6.4 6.4-6.4 0 4-2.4 6.4-6.4 6.4Z" fill="currentColor" />
        <rect x="15.45" y="7.2" width="1.1" height="4.6" rx="0.55" fill="currentColor" />
        <path d="M4 11.2c4-1.9 8.5-1.8 11.2 0v14.2c-2.7-1.7-7.2-1.8-11.2.2Z" fill="currentColor" />
        <path d="M28 11.2c-4-1.9-8.5-1.8-11.2 0v14.2c2.7-1.7 7.2-1.8 11.2.2Z" fill="currentColor" />
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
