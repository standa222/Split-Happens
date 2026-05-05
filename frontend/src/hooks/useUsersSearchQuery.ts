import { useQuery } from "@tanstack/react-query";
import { api } from "../axios/axios";
import { TUser } from "../types/TUser";

export type UsersSearchParams = {
  query: string;
  limit?: number;
};

const DEFAULT_LIMIT = 20;

const fetchUsersSearch = async ({
  query,
  limit = DEFAULT_LIMIT,
}: UsersSearchParams): Promise<TUser[]> => {
  const q = query.trim();
  if (q.length < 2) return [];

  const { data } = await api.get("/users", {
    params: { query: q, limit },
  });

  return Array.isArray(data) ? data : [];
};

export const useUsersSearchQuery = (params: UsersSearchParams) => {
  const q = params.query.trim();

  return useQuery({
    queryKey: ["usersSearch", q, params.limit ?? DEFAULT_LIMIT],
    queryFn: () => fetchUsersSearch(params),
    enabled: q.length >= 2,
    retry: false,
    staleTime: 30_000,
  });
};
