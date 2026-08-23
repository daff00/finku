import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// ── Request interceptor — attach token ────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ── Response interceptor — handle errors ──────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // if 401 -> token expired or invalid -> redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        const message = error.response?.data?.error || "Something went wrong"
        return Promise.reject(new Error(message))
    }
)

export default api