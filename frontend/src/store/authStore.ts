import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TUser } from '../types/TUser';

interface AuthState {
    token: string | null;
    currentUser: TUser | null;
    setToken: (token: string) => void;
    setCurrentUser: (user: TUser | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            currentUser: null,
            setToken: (token) => set({ token }),
            setCurrentUser: (user) => set({ currentUser: user }),
            logout: () => set({ token: null })
        }),
        { name: 'auth-storage' }
    )
)