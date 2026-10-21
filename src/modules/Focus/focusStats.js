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


const dateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const validSessionDate = (session) => {
    if (!session?.created_at) return null;
    const date = new Date(session.created_at);
    return Number.isNaN(date.getTime()) ? null : date;
};

/** Build a calendar-day window from saved sessions for charts and recent-history UI. */
export const summarizeFocusWindow = (sessions = [], days = 7, now = new Date()) => {
    const windowDays = Number(days) === 30 ? 30 : 7;
    const current = now instanceof Date ? new Date(now.getTime()) : new Date(now);
    if (Number.isNaN(current.getTime())) throw new TypeError('now must be a valid date');

    const todayStart = new Date(current);
    todayStart.setHours(0, 0, 0, 0);
    const start = new Date(todayStart);
    start.setDate(start.getDate() - (windowDays - 1));

    const buckets = Array.from({ length: windowDays }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        return {
            key: dateKey(date),
            label: windowDays === 7
                ? date.toLocaleDateString(undefined, { weekday: 'short' })
                : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            dateLabel: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
            sessions: 0,
            seconds: 0,
            minutes: 0,
        };
    });

    const bucketsByDate = new Map(buckets.map(bucket => [bucket.key, bucket]));
    const normalized = (Array.isArray(sessions) ? sessions : [])
        .map(session => {
            const createdAt = validSessionDate(session);
            const seconds = Number(session?.duration_seconds);
            return {
                ...session,
                createdAt,
                safeSeconds: Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0,
                safeCategory: typeof session?.category === 'string' && session.category.trim()
                    ? session.category.trim().slice(0, 100)
                    : 'Uncategorised',
            };
        })
        .filter(session => session.createdAt);

    const windowSessions = normalized.filter(session =>
        session.createdAt >= start && session.createdAt <= current
    );

    const categoryMap = new Map();
    windowSessions.forEach(session => {
        const bucket = bucketsByDate.get(dateKey(session.createdAt));
        if (bucket) {
            bucket.sessions += 1;
            bucket.seconds += session.safeSeconds;
        }

        const category = categoryMap.get(session.safeCategory) || {
            category: session.safeCategory,
            sessions: 0,
            seconds: 0,
            minutes: 0,
        };
        category.sessions += 1;
        category.seconds += session.safeSeconds;
        categoryMap.set(session.safeCategory, category);
    });

    buckets.forEach(bucket => {
        bucket.minutes = Math.round(bucket.seconds / 60);
    });

    const categories = [...categoryMap.values()]
        .map(category => ({ ...category, minutes: Math.round(category.seconds / 60) }))
        .sort((a, b) => b.seconds - a.seconds || b.sessions - a.sessions)
        .slice(0, 6);

    const totalSeconds = windowSessions.reduce((total, session) => total + session.safeSeconds, 0);
    return {
        days: windowDays,
        startDate: start,
        endDate: current,
        totalSessions: windowSessions.length,
        totalSeconds,
        totalMinutes: Math.round(totalSeconds / 60),
        activeDays: buckets.filter(bucket => bucket.sessions > 0).length,
        dailyBuckets: buckets,
        categories,
        recentSessions: [...windowSessions]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 8),
    };
};
