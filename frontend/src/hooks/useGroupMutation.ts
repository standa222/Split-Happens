import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";
import { TGroupDetail } from "../types/dto/TGroupDetail";
import { TCreateGroupForm } from "../types/form/TCreateGroupForm";

type Options = {
  onSuccess?: () => void;
};

export function useCreateGroupMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<TGroupDetail, Error, TCreateGroupForm>({
    mutationFn: (data) => api.post("/groups", data).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      options?.onSuccess?.();
    },
    onError: (error) => console.error("Error creating group:", error),
  });
}

export function useEditGroupMutation(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<TGroupDetail, Error, { groupId: number; data: TCreateGroupForm }>({
    mutationFn: ({ groupId, data }: { groupId: number; data: TCreateGroupForm }) =>
      api.put(`/groups/${groupId}`, data).then((res) => res.data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
      options?.onSuccess?.();
    },
    onError: (error) => console.error("Error editing group:", error),
  });
}

export function useLeaveGroup(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (groupId) => api.get(`/groups/${groupId}/leave`).then((res) => res.data),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groupDetail", groupId] });
      options?.onSuccess?.();
    },
    onError: (error) => console.error("Error leaving group:", error),
  });
}
