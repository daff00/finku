import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.error || "Something went wrong"
        return Promise.reject(new Error(message))
    }
)

export default api