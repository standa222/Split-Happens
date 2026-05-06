import { useQuery } from "@tanstack/react-query";
import { api } from "../axios/axios";
import type { TGroupLight } from "../types/dto/TGroupLight";
import type { TUser } from "../types/TUser";

export type AdminProbeResult = {
  groupsOk: boolean;
  usersOk: boolean;
};

const fetchAdminProbe = async (): Promise<AdminProbeResult> => {
  const [groups, users] = await Promise.all([
    api.get("/groups/admin", {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 403,
    }),
    api.get("/users/admin", {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 403,
    }),
  ]);

  return {
    groupsOk: groups.status >= 200 && groups.status < 300,
    usersOk: users.status >= 200 && users.status < 300,
  };
};

export const useAdminQuery = () => {
  return useQuery({
    queryKey: ["adminProbe"],
    queryFn: fetchAdminProbe,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

const fetchAdminGroups = async (): Promise<TGroupLight[]> => {
  const { data } = await api.get("/groups/admin");
  return Array.isArray(data) ? (data as TGroupLight[]) : [];
};

export const useAdminGroupsQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ["adminGroups"],
    queryFn: fetchAdminGroups,
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};

const fetchAdminUsers = async (): Promise<TUser[]> => {
  const { data } = await api.get("/users/admin");
  return Array.isArray(data) ? (data as TUser[]) : [];
};

export const useAdminUsersQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchAdminUsers,
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
};
