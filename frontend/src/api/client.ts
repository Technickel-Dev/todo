export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5214';

// Create a configured fetch wrapper that automatically includes credentials (cookies)
export const apiClient = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const url = `${API_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        // CRITICAL: This ensures HTTP-only cookies (like the ASP.NET Core Identity cookie) 
        // are sent with cross-origin or same-origin requests naturally.
        // credentials: 'include',
    };

    const response = await fetch(url, defaultOptions);

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
