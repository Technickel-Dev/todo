export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5214';

// Create a configured fetch wrapper that automatically includes credentials (cookies)
export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = `${API_URL}${endpoint}`;

    const executeRequest = async (token: string | null) => {
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    };

    const getAuth = () => {
        const auth = localStorage.getItem('auth');
        return auth ? JSON.parse(auth) : null;
    };

    let auth = getAuth();
    let response = await executeRequest(auth?.accessToken);

    // If 401 and we have a refresh token, try to refresh and retry
    if (response.status === 401 && endpoint !== '/login' && endpoint !== '/refresh') {
        const refreshToken = auth?.refreshToken;
        if (refreshToken) {
            try {
                const refreshResponse = await fetch(`${API_URL}/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshResponse.ok) {
                    const newTokens = await refreshResponse.json();
                    localStorage.setItem('auth', JSON.stringify(newTokens));

                    // Retry original request and replace the response object
                    response = await executeRequest(newTokens.accessToken);
                }
            } catch (err) {
                console.error('Token refresh failed:', err);
            }
        }
    }

    // Capture the final 401 state (either from the first try or the retry)
    if (response.status === 401 && endpoint !== '/login') {
        localStorage.removeItem('auth');
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    }

    // Try to parse JSON if the response has it
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
    } else {
        data = await response.text().catch(() => null);
    }

    if (!response.ok) {
        // Attempt to extract ProblemDetails if available
        const errorMessage = data?.detail || data?.title || typeof data === 'string' ? data : 'An unexpected error occurred';
        throw new Error(errorMessage as string);
    }

    return { response, data };
};
