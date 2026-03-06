export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5214';

// Create a configured fetch wrapper that automatically includes credentials (cookies)
export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = `${API_URL}${endpoint}`;

    const executeRequest = async () => {
        const csrfToken = localStorage.getItem('xsrf-token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as any,
        };

        if (['POST', 'PUT', 'DELETE'].includes(options.method || 'GET') && csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        return fetch(url, {
            ...options,
            credentials: 'include',
            headers,
        });
    };

    let response = await executeRequest();

    if (response.status === 401 && endpoint !== '/login') {
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
