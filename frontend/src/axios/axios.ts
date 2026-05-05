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

    if (status === 401 && !isHandlingAuthFailure) {
      isHandlingAuthFailure = true;
      try {
        useAuthStore.getState().logout();
      } finally {
        window.location.href = "/login";
        isHandlingAuthFailure = false;
      }
    }

    return Promise.reject(error);
  }
);
