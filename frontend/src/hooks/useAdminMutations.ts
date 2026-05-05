import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";

type Options = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const useAdminDeleteGroupMutation = (options?: Options) => {
  const qc = useQueryClient();

  return useMutation<void, unknown, { groupId: number }>({
    mutationFn: ({ groupId }) => api.delete(`/groups/${groupId}`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminGroups"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};

export const useAdminDeleteUserMutation = (options?: Options) => {
  const qc = useQueryClient();

  return useMutation<void, unknown, { userId: number }>({
    mutationFn: ({ userId }) => api.delete(`/users/${userId}`).then(() => undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
};