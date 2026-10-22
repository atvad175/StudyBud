import { getLocalDateKey } from '../../utils/localDateKey';

const hasCompletedHabit = (dateLogs) =>
    Boolean(dateLogs && typeof dateLogs === 'object' && Object.values(dateLogs).some(
        (log) => log?.status === 'completed' || log?.completed === true
    ));

const previousDateKey = (dateKey) => {
    if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return '';
    const [year, month, day] = dateKey.split('-').map(Number);
    const previous = new Date(year, month - 1, day);
    if (Number.isNaN(previous.getTime())) return '';
    previous.setDate(previous.getDate() - 1);
    return getLocalDateKey(previous);
};

// Counts consecutive local-calendar days with at least one completed habit.
// If nothing has been completed yet today, the streak remains live through
// the previous day instead of dropping to zero at midnight.
export const getCurrentHabitStreak = (logs, now = new Date()) => {
    if (!logs || typeof logs !== 'object' || Array.isArray(logs)) return 0;

    const today = getLocalDateKey(now);
    if (!today) return 0;

    let cursor = hasCompletedHabit(logs[today]) ? today : previousDateKey(today);
    let streak = 0;

    while (cursor && hasCompletedHabit(logs[cursor])) {
        streak += 1;
        cursor = previousDateKey(cursor);
    }

    return streak;
};
