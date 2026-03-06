import { apiClient } from './client';
import type { LoginRequest, RegisterRequest } from '../types';

export const authService = {
    async fetchCsrfToken(): Promise<void> {
        const { data } = await apiClient('/antiforgery/token');
        if (data && data.token) {
            localStorage.setItem('xsrf-token', data.token);
        }
    },

    async login(credentials: LoginRequest): Promise<void> {
        await apiClient('/login?useCookies=true', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // With cookie-based auth, we just track that we're logged in for UI hints
        localStorage.setItem('is-authenticated', 'true');
        await this.fetchCsrfToken();
    },

    async refresh(): Promise<void> {
        // Refreshing with cookies is usually handled by the browser 
        // or by calling a refresh endpoint that updates cookies
        await apiClient('/refresh', {
            method: 'POST',
            body: JSON.stringify({}), // refreshToken comes from cookie
        });
    },

    async register(credentials: RegisterRequest): Promise<void> {
        await apiClient('/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    async logout(): Promise<void> {
        try {
            await apiClient('/logout', { method: 'POST' });
        } finally {
            localStorage.removeItem('is-authenticated');
            localStorage.removeItem('xsrf-token');
            window.location.href = '/login';
        }
    },

    isAuthenticated(): boolean {
        return localStorage.getItem('is-authenticated') === 'true';
    }
};
