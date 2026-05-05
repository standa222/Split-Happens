import { useMutation } from "@tanstack/react-query";
import { api } from "../axios/axios";
import { useAuthStore } from "../store/authStore";
import { TUser } from "../types/TUser";
import { TUpdateProfileForm } from "../types/form/TUpdateProfileForm";

type Options = {
  onSuccess?: () => void;
};

export function useUpdateProfile(options?: Options) {
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);

  return useMutation<TUser, Error, TUpdateProfileForm>({
    mutationFn: (data) => api.put("/users", data).then((res) => res.data),
    onSuccess: (user) => {
      setCurrentUser(user);
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
    },
  });
}
