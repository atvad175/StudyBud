export const buildHabitLogPayload = ({ atomId, date, userId, previousLog = null, changes = {} }) => {
    const hasOwn = (key) => Object.prototype.hasOwnProperty.call(changes, key);
    const status = hasOwn('status')
        ? changes.status
        : hasOwn('completed')
            ? (changes.completed ? 'completed' : 'pending')
            : previousLog?.status || 'pending';

    return {
        atom_id: atomId,
        date_logged: date,
        status,
        mood: hasOwn('mood') ? changes.mood : previousLog?.mood ?? null,
        duration: hasOwn('duration') ? changes.duration : previousLog?.duration ?? null,
        time: hasOwn('time') ? changes.time : previousLog?.time ?? null,
        user_id: userId,
    };
};

export const buildHabitLogMap = (rows = []) => {
    const result = {};
    (Array.isArray(rows) ? rows : []).forEach(log => {
        if (!log?.date_logged || log.atom_id === undefined || log.atom_id === null) return;
        if (!result[log.date_logged]) result[log.date_logged] = {};
        result[log.date_logged][log.atom_id] = {
            id: log.id,
            status: log.status || 'pending',
            completed: log.status === 'completed',
            mood: log.mood ?? null,
            duration: log.duration ?? null,
            time: log.time ?? null,
        };
    });
    return result;
};
