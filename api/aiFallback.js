const getStatus = (error) => Number(
    error?.status ??
    error?.httpErrorCode ??
    error?.response?.status ??
    error?.cause?.status ??
    0
);

export const isQuotaError = (error) => {
    const status = getStatus(error);
    const message = String(error?.message || '').toLowerCase();
    return status === 429 ||
        message.includes('quota') ||
        message.includes('resource exhausted') ||
        message.includes('rate limit');
};

/**
 * Decide whether the next configured model should be tried after a failed
 * request. This is a single fallback attempt, not an unbounded retry loop.
 * Authentication and invalid-input errors are not retried because they will
 * not improve by switching models.
 */
export const shouldTryNextModel = (error, hasNextModel) => {
    if (!hasNextModel) return false;
    if (isQuotaError(error)) return true;

    const status = getStatus(error);
    if (status === 400 || status === 401 || status === 403) return false;
    if ([408, 425, 500, 502, 503, 504].includes(status)) return true;

    const message = String(error?.message || '').toLowerCase();
    if (status === 404) {
        return /model.*(not found|does not exist|unavailable|not supported)|(?:not found|does not exist|unavailable|not supported).*model/.test(message);
    }

    return /temporarily unavailable|overloaded|deadline exceeded|timed? ?out|econnreset|econnrefused|etimedout|eai_again|fetch failed|socket hang up|network error/.test(message);
};
