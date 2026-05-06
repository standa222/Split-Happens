import {api} from "../axios/axios";
import {TNotification} from "../types/dto/TNotification";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

type Options = {
    onSuccess?: () => void;
};

const fetchNotifications = async (): Promise<TNotification[]> => {
    const { data } = await api.get("/notifications");
    return data.content;
}

const fetchUnreadNotificationsCount = async (): Promise<number> => {
    const { data } = await api.get("/notifications/unread-count");
    return data;
}

export const useNotificationsQuery = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        retry: false,
        staleTime: 0,
        refetchInterval: 5_000,
        refetchOnWindowFocus: true,
    });
}

export const useUnreadNotificationsCountQuery = () => {
    return useQuery({
        queryKey: ["notifications", "unreadCount"],
        queryFn: fetchUnreadNotificationsCount,
        retry: false,
        staleTime: 0,
        refetchInterval: 5_000,
        refetchOnWindowFocus: true,
    });
}

const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/mark-read`);
}

const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.post("/notifications/mark-read");
}

export const useMarkNotificationAsReadMutation = (options?: Options) => {
    const qc = useQueryClient();

    return useMutation<void, unknown, number>({
        mutationFn: (notificationId) => markNotificationAsRead(notificationId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["notifications", "unreadCount"] });
            options?.onSuccess?.();
        },
    });
}

export const useMarkAllAsReadMutation = (options?: Options) => {
    const qc = useQueryClient();

    return useMutation<void, unknown, void>({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["notifications", "unreadCount"] });
            options?.onSuccess?.();
        },
    });
}

const fetchLatestNotifications = async (limit: number = 4): Promise<TNotification[]> => {
  const { data } = await api.get("/notifications", {
    params: {
      size: limit,
      page: 0,
      sort: 'createdAt,desc'
    }
  });
  return data.content;
}

export const useLatestNotificationsQuery = (limit: number = 4) => {
  return useQuery({
    queryKey: ["notifications", "latest", limit],
    queryFn: () => fetchLatestNotifications(limit),
    retry: false,
    staleTime: 0,
  });
}