import axios from 'axios'
import {useAuthStore} from "../store/authStore";

export const api = axios.create({
    baseURL: import.meta.env.VITE_BE_URL || 'http://localhost:0001/',
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    console.log("Attaching token to request:", token)
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})