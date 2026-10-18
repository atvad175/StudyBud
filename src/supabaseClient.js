import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const AUTH_REQUEST_TIMEOUT_MS = 20_000;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

/**
 * Authentication endpoints must not leave the UI in a permanent loading state
 * when the connection stalls. Other Supabase operations keep their normal fetch
 * behavior; only signup/password-token requests receive this timeout.
 */
const fetchWithAuthTimeout = async (input, init = {}) => {
    const requestUrl = typeof input === 'string'
        ? input
        : (input && typeof input.url === 'string' ? input.url : '');

    let isAuthRequest = false;
    try {
        const pathname = new URL(requestUrl).pathname;
        isAuthRequest = pathname.endsWith('/auth/v1/signup') || pathname.endsWith('/auth/v1/token');
    } catch {
        return fetch(input, init);
    }

    if (!isAuthRequest) return fetch(input, init);

    const controller = new AbortController();
    const callerSignal = init.signal || (typeof Request !== 'undefined' && input instanceof Request ? input.signal : undefined);
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
    }, AUTH_REQUEST_TIMEOUT_MS);

    const abortFromCaller = () => controller.abort(callerSignal?.reason);
    if (callerSignal) {
        if (callerSignal.aborted) abortFromCaller();
        else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
    }

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } catch (error) {
        if (didTimeout && !callerSignal?.aborted) {
            const timeoutError = new Error('Authentication request timed out. Check your connection and try again.');
            timeoutError.name = 'AuthRequestTimeoutError';
            throw timeoutError;
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
        callerSignal?.removeEventListener('abort', abortFromCaller);
    }
};

/**
 * Diagnose whether the configured Supabase Auth host is responding after an
 * auth request times out. This never sends user credentials and never logs the
 * API key. Any HTTP response means the host was reached, even if it is an error.
 */
export const diagnoseAuthService = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        return { reachable: false, reason: 'missing-config' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5_000);

    try {
        let baseUrl = supabaseUrl;
        while (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        const response = await fetch(`${baseUrl}/auth/v1/health`, {
            method: 'GET',
            headers: { apikey: supabaseAnonKey },
            signal: controller.signal,
        });

        return { reachable: true, status: response.status };
    } catch (error) {
        return {
            reachable: false,
            reason: error?.name === 'AbortError' ? 'probe-timeout' : 'network-error',
        };
    } finally {
        clearTimeout(timeoutId);
    }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: fetchWithAuthTimeout },
});
