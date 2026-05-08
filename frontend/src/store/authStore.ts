import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TUser } from "../types/TUser";
import {QueryClient, useQueryClient} from "@tanstack/react-query";

interface AuthState {
  token: string | null;
  currentUser: TUser | null;
  setToken: (token: string) => void;
  setCurrentUser: (user: TUser | null) => void;
  logout: () => void;
}

export const queryClient = new QueryClient();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      currentUser: null,
      setToken: (token) => set({ token }),
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => {
        set({ token: null, currentUser: null })
        queryClient.clear();
      },
    }),
    { name: "auth-storage" }
  )
);
