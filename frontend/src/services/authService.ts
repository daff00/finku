import api from '@/services/api'
import type { User } from '@/types'

export type LoginRequest = {
    username: string
    password: string
}

export type TokenOut = {
    access_token: string
    token_type: string
}

interface RegisterPayload {
    username: string;
    password: string;
    display_name: string;
    adminKey: string;
}

export const authService = {
    login: async (payload: LoginRequest): Promise<TokenOut> => {
        const formData = new FormData()
        formData.append('username', payload.username)
        formData.append('password', payload.password)

        const response = await api.post('auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout')
        localStorage.removeItem('token')
    },

    me: async (): Promise<User> => {
        const response = await api.get('/auth/me')
        return response.data
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token')
    },

    saveToken: (token: string): void => {
        localStorage.setItem('token', token)
    },

    getToken: (): string | null => {
        return localStorage.getItem('token')
    },

    clearToken: (): void => {
        localStorage.removeItem('token')
    },

    register: async (payload: RegisterPayload): Promise<User> => {
        const { adminKey, ...body } = payload;
        const response = await api.post("/auth/register", body, {
            headers: { "X-Admin-Key": adminKey },
        });
        return response.data;
    },

    updateProfile: async (displayName: string): Promise<User> => {
        const response = await api.patch('/auth/me', { display_name: displayName })
        return response.data
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
        const response = await api.post('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        })
        return response.data
    },
}