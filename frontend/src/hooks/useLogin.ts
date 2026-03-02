import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../axios/axios'
import { useAuthStore } from '../store/authStore'
import { ROUTES } from '../enums/routes'
import {TLoginFormSchema} from "../types/form/TLoginForm";
import {TLoginResponse} from "../types/dto/TLoginResponse";

export function useLogin() {
    const { setCurrentUser, setToken } = useAuthStore()
    const navigate = useNavigate()

    return useMutation<TLoginResponse, Error, TLoginFormSchema>({
        mutationFn: (data) => api.post('/auth/login', data).then(res => res.data),
        onSuccess: (data) => {
            setToken(data.token)
            setCurrentUser(data.user)
            navigate(ROUTES.HOME)
        },
        onError: (error) => {
            console.error('Login error:', error)
        }
    })
}
