import {TUser} from "../types/TUser";
import {useMutation} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {TRegisterForm} from "../types/form/TRegisterForm";

type Options = {
    onSuccess?: () => void;
}

export function useRegisterUser(options?: Options) {
    return useMutation<TUser, Error, TRegisterForm>({
        mutationFn: (data) => api.post('/users', data).then(res => res.data),
        onSuccess: (data) => {
            console.log('User registered successfully:', data);
            options?.onSuccess?.();
        },
        onError: (error) => console.error('Error registering user:', error)
    })
}