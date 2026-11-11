export const requireExpectedAccountUser = async (authClient, expectedUserId, action = 'continue') => {
    if (typeof expectedUserId !== 'string' || !expectedUserId.trim()) {
        throw new Error('Sign in to ' + action + '.');
    }
    if (!authClient || typeof authClient.getUser !== 'function') {
        throw new Error('Your account session could not be verified. Sign in again to ' + action + '.');
    }

    let result;
    try {
        result = await authClient.getUser();
    } catch {
        throw new Error('Your account session could not be verified. Check your connection and sign in again.');
    }

    if (result?.error) {
        throw new Error('Your account session could not be verified. Check your connection and sign in again.');
    }

    const user = result?.data?.user;
    if (!user?.id || user.id !== expectedUserId) {
        throw new Error('Your account changed before this action completed. Refresh StudyBud and try again.');
    }
    return user;
};

export const isExpectedAccountUser = (user, expectedUserId) =>
    Boolean(user?.id && typeof expectedUserId === 'string' && expectedUserId && user.id === expectedUserId);
