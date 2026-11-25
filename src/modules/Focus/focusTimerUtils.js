export const ACTIVE_FOCUS_SESSION_KEY = 'studybud_active_focus_session_v1';
export const PENDING_FOCUS_SESSION_KEY = 'studybud_pending_focus_session_v1';

export const accountScopedFocusStorageKey = (baseKey, ownerUserId) => {
    if (typeof baseKey !== 'string' || !baseKey.trim()) return null;
    if (typeof ownerUserId !== 'string' || !ownerUserId.trim()) return null;
    return `${baseKey}_${ownerUserId.trim()}`;
};

const MAX_DURATION_SECONDS = 12 * 60 * 60;

const asNonNegativeSeconds = (value) => {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds >= 0
        ? Math.floor(Math.min(seconds, MAX_DURATION_SECONDS))
        : 0;
};

export const remainingSeconds = (deadlineAt, now = Date.now()) => {
    const deadline = Number(deadlineAt);
    if (!Number.isFinite(deadline) || deadline <= 0) return 0;
    return Math.max(0, Math.ceil((deadline - now) / 1000));
};

export const stopwatchElapsedSeconds = (
    startedAt,
    accumulatedSeconds = 0,
    now = Date.now()
) => {
    const accumulated = asNonNegativeSeconds(accumulatedSeconds);
    if (startedAt === null || startedAt === undefined) return accumulated;

    const start = Number(startedAt);
    if (!Number.isFinite(start) || start <= 0) return accumulated;

    return accumulated + Math.max(0, Math.floor((now - start) / 1000));
};

/**
 * Reconstruct an active session after a page reload.
 * Deadlines, rather than a tick count, keep timers correct when tabs are throttled.
 */
export const hydrateActiveFocusSession = (saved, now = Date.now()) => {
    if (!saved || saved.version !== 1 || saved.isActive !== true) return null;
    if (!['TIMER', 'STOPWATCH'].includes(saved.mode)) return null;

    const isPaused = saved.isPaused === true;
    const duration = asNonNegativeSeconds(saved.duration);
    const storedTimeLeft = asNonNegativeSeconds(saved.timeLeft);
    let timeLeft = storedTimeLeft;

    if (!isPaused) {
        timeLeft = saved.mode === 'TIMER'
            ? remainingSeconds(saved.deadlineAt, now)
            : stopwatchElapsedSeconds(
                saved.stopwatchStartedAt,
                saved.stopwatchElapsedBase,
                now
            );
    }

    return {
        version: 1,
        isActive: true,
        isPaused,
        mode: saved.mode,
        duration,
        timeLeft,
        category: typeof saved.category === 'string' && saved.category.trim()
            ? saved.category.slice(0, 100)
            : 'Deep Work',
        deadlineAt: Number.isFinite(Number(saved.deadlineAt)) ? Number(saved.deadlineAt) : null,
        stopwatchStartedAt: Number.isFinite(Number(saved.stopwatchStartedAt))
            ? Number(saved.stopwatchStartedAt)
            : null,
        stopwatchElapsedBase: asNonNegativeSeconds(saved.stopwatchElapsedBase),
        ownerUserId: typeof saved.ownerUserId === 'string' ? saved.ownerUserId : null,
    };
};

const getSessionStorage = () => {
    try {
        return typeof window !== 'undefined' ? window.sessionStorage : null;
    } catch {
        return null;
    }
};

export const readStoredJson = (key) => {
    if (typeof key !== 'string' || !key) return null;
    const storage = getSessionStorage();
    if (!storage) return null;
    try {
        const raw = storage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const writeStoredJson = (key, value) => {
    if (typeof key !== 'string' || !key) return false;
    const storage = getSessionStorage();
    if (!storage) return false;
    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
};

export const removeStoredValue = (key) => {
    if (typeof key !== 'string' || !key) return false;
    const storage = getSessionStorage();
    if (!storage) return false;
    try {
        storage.removeItem(key);
        return true;
    } catch {
        return false;
    }
};

export const readPendingFocusSession = (key = PENDING_FOCUS_SESSION_KEY) => {
    const draft = readStoredJson(key);
    if (!draft || draft.version !== 1) return null;

    const durationSeconds = Number(draft.duration_seconds);
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;
    if (!['TIMER', 'STOPWATCH'].includes(draft.mode)) return null;
    if (!['completed', 'stopped'].includes(draft.reason)) return null;
    if (typeof draft.created_at !== 'string' || Number.isNaN(Date.parse(draft.created_at))) return null;

    return {
        version: 1,
        category: typeof draft.category === 'string' ? draft.category.slice(0, 100) : 'Deep Work',
        duration_seconds: Math.floor(Math.min(durationSeconds, MAX_DURATION_SECONDS)),
        mode: draft.mode,
        reason: draft.reason,
        created_at: draft.created_at,
        configured_duration: asNonNegativeSeconds(draft.configured_duration),
        owner_user_id: typeof draft.owner_user_id === 'string' ? draft.owner_user_id : null,
    };
};
