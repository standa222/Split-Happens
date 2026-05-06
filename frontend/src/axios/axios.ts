import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BE_URL || "http://localhost:0001/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandlingAuthFailure = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const originalRequest = error.config;

    const isLoginRequest = originalRequest.url.includes("/auth/login");

    if (status === 401 && !isLoginRequest && !isHandlingAuthFailure) {
      isHandlingAuthFailure = true;
      try {
        useAuthStore.getState().logout();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } finally {
        isHandlingAuthFailure = false;
      }
    }

    return Promise.reject(error);
  }
);
