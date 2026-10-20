const DAY_IN_MS = 24 * 60 * 60 * 1000;

const asDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const validDuration = (session) => {
    const seconds = Number(session?.duration_seconds);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
};

const isSameLocalDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

/**
 * Summarize the latest saved focus sessions.
 * `now` is injectable to keep time-window behavior deterministic in tests.
 */
export const summarizeFocusSessions = (sessions = [], now = new Date()) => {
    const currentTime = now.getTime();
    const weekStart = currentTime - (7 * DAY_IN_MS);
    const normalized = (Array.isArray(sessions) ? sessions : [])
        .map((session) => ({
            session,
            createdAt: asDate(session?.created_at),
            durationSeconds: validDuration(session),
        }))
        .filter((entry) => entry.createdAt);

    const today = normalized.filter(({ createdAt }) =>
        createdAt.getTime() <= currentTime && isSameLocalDay(createdAt, now)
    );
    const lastSevenDays = normalized.filter(({ createdAt }) => {
        const timestamp = createdAt.getTime();
        return timestamp >= weekStart && timestamp <= currentTime;
    });

    const totalSeconds = (entries) =>
        entries.reduce((total, entry) => total + entry.durationSeconds, 0);

    return {
        sessionsToday: today.length,
        minutesToday: Math.round(totalSeconds(today) / 60),
        sessionsLastSevenDays: lastSevenDays.length,
        minutesLastSevenDays: Math.round(totalSeconds(lastSevenDays) / 60),
    };
};
