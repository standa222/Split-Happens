import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";
import type { TFriendDto } from "../types/dto/TFriendDto";
import type { TFriendRequestCreateDto } from "../types/dto/TFriendRequestCreateDto";
import type { TFriendRequestDto } from "../types/dto/TFriendRequestDto";

type Options = {
  onSuccess?: () => void;
};

const fetchIncomingRequests = async (): Promise<TFriendRequestDto[]> => {
  const { data } = await api.get("/friend-requests/incoming");
  return Array.isArray(data) ? data : [];
};

const fetchOutgoingRequests = async (): Promise<TFriendRequestDto[]> => {
  const { data } = await api.get("/friend-requests/outgoing");
  return Array.isArray(data) ? data : [];
};

const fetchFriends = async (): Promise<TFriendDto[]> => {
  const { data } = await api.get("/friends");
  return Array.isArray(data) ? data : [];
};

export const useIncomingFriendRequestsQuery = () => {
  return useQuery({
    queryKey: ["friendRequests", "incoming"],
    queryFn: fetchIncomingRequests,
    retry: false,
    staleTime: 10_000,
  });
};

export const useOutgoingFriendRequestsQuery = () => {
  return useQuery({
    queryKey: ["friendRequests", "outgoing"],
    queryFn: fetchOutgoingRequests,
    retry: false,
    staleTime: 10_000,
  });
};

export const useFriendsQuery = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    retry: false,
    staleTime: 10_000,
  });
};

export const useCreateFriendRequestMutation = (options?: Options) => {
  const qc = useQueryClient();

  return useMutation<TFriendRequestDto, unknown, TFriendRequestCreateDto>({
    mutationFn: (dto) => api.post("/friend-requests", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests", "outgoing"] });
      options?.onSuccess?.();
    },
  });
};

export const useAcceptFriendRequestMutation = (options?: Options) => {
  const qc = useQueryClient();

  return useMutation<TFriendRequestDto, unknown, { requestId: number }>({
    mutationFn: ({ requestId }) => api.post(`/friend-requests/${requestId}/accept`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
      qc.invalidateQueries({ queryKey: ["friends"] });
      options?.onSuccess?.();
    },
  });
};

export const useRejectFriendRequestMutation = (options?: Options) => {
  const qc = useQueryClient();

  return useMutation<TFriendRequestDto, unknown, { requestId: number }>({
    mutationFn: ({ requestId }) => api.post(`/friend-requests/${requestId}/reject`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["friendRequests", "incoming"] });
      options?.onSuccess?.();
    },
  });
};

