export interface Todo {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    createdAt: string;
}

export interface LoginRequest {
    email: string;
    password?: string;
}

export interface RegisterRequest {
    email: string;
    password?: string;
}

export interface AuthResponse {
    tokenType: string;
    accessToken: string;
    expiresIn: number;
    refreshToken: string;
}
