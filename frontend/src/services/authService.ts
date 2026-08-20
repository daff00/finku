import api from '@/services/api'

export type LoginRequest = {
    username: string
    password: string
}

export type TokenOut = {
    access_token: string
    token_type: string
}

export type UserOut = {
    id: number
    username: string
    display_name: string
    is_active: boolean
    created_at: string
}

export const authService = {
    login: async (payload: LoginRequest): Promise<TokenOut> => {
        //OAuth2 requires form-data not JSON
        const formData = new FormData()
        formData.append('username', payload.username)
        formData.append('password', payload.password)

        const response = await api.post('auth/login', formData, {
            headers: { 'Content-Type' : 'multipart/form-data' }
    })
        return response.data
    },
    
    logout: async (): Promise<void> => {
        await api.post('/auth/logout')
        localStorage.removeItem('token')
    },

    me: async (): Promise<UserOut> => {
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
}