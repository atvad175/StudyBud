const DAY_MS = 24 * 60 * 60 * 1000;

const toLocalDateKey = date => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
].join('-');

const parseDateKey = key => {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
};

const dayOrdinal = date => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);

const getCompletedCount = dateLogs => {
    if (!dateLogs || typeof dateLogs !== 'object') return 0;
    return Object.values(dateLogs).filter(log => log?.status === 'completed' || log?.completed === true).length;
};

export const buildHabitStreakData = (logs = {}, now = new Date()) => {
    const today = new Date(now);
    if (!Number.isFinite(today.getTime())) throw new Error('A valid current date is required.');
    today.setHours(0, 0, 0, 0);

    const completedByDate = new Map();
    Object.entries(logs && typeof logs === 'object' ? logs : {}).forEach(([dateKey, dateLogs]) => {
        const parsed = parseDateKey(dateKey);
        if (!parsed || parsed > today) return;
        const count = getCompletedCount(dateLogs);
        if (count > 0) completedByDate.set(dateKey, count);
    });

    // A 13-week calendar always starts on Monday and contains the current week.
    const mondayOffset = (today.getDay() + 6) % 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - mondayOffset - (12 * 7));

    const heatmap = Array.from({ length: 91 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        const dateKey = toLocalDateKey(date);
        const isFuture = date > today;
        return {
            date: dateKey,
            count: isFuture ? 0 : (completedByDate.get(dateKey) || 0),
            isFuture,
        };
    });

    // Longest streak uses all saved history, not just the 13-week chart window.
    const completedDates = [...completedByDate.keys()]
        .map(parseDateKey)
        .sort((a, b) => dayOrdinal(a) - dayOrdinal(b));
    let longestStreak = 0;
    let runningStreak = 0;
    let previousOrdinal = null;
    completedDates.forEach(date => {
        const ordinal = dayOrdinal(date);
        runningStreak = previousOrdinal === ordinal - 1 ? runningStreak + 1 : 1;
        longestStreak = Math.max(longestStreak, runningStreak);
        previousOrdinal = ordinal;
    });

    // A streak remains current through today or yesterday; two missed days end it.
    let cursor = new Date(today);
    if (!completedByDate.has(toLocalDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }
    let currentStreak = 0;
    while (completedByDate.has(toLocalDateKey(cursor))) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthActiveDays = [...completedByDate.keys()].filter(key => {
        const date = parseDateKey(key);
        return date >= monthStart && date <= today;
    }).length;
    const monthElapsedDays = today.getDate();

    return {
        heatmap,
        stats: {
            currentStreak,
            longestStreak,
            monthActiveDays,
            monthElapsedDays,
            monthActiveRate: monthElapsedDays
                ? Math.round((monthActiveDays / monthElapsedDays) * 100)
                : 0,
        },
    };
};
