export const getNextReviewIntervalDays = (rating, currentInterval = 1) => {
    const interval = Math.max(1, Number(currentInterval) || 1);
    switch (rating) {
        case 'again': return 1;
        case 'hard': return Math.max(2, Math.ceil(interval * 1.5));
        case 'easy': return Math.max(4, Math.round(interval * 2.5));
        case 'good':
        default:
            return interval <= 1 ? 3 : Math.round(interval * 2);
    }
};

export const getStudyReviewDedupeKey = (subject, content) => {
    const normalize = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    const normalizedContent = normalize(content);
    if (!normalizedContent) return '';
    return normalize(subject) + '\u001f' + normalizedContent;
};
