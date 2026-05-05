import { useQuery } from "@tanstack/react-query";
import { api } from "../axios/axios";
import type { TGroupStatistics } from "../types/dto/TGroupStatistics";

export type GroupStatisticsParams = {
  groupId: number;
  year?: number;
  month?: number; // 1-12
};

const fetchGroupStatistics = async ({
  groupId,
  year,
  month,
}: GroupStatisticsParams): Promise<TGroupStatistics> => {
  const { data } = await api.get(`/groups/${groupId}/statistics`, {
    params: {
      ...(year ? { year } : {}),
      ...(month ? { month } : {}),
    },
  });

  return data;
};

export const useGroupStatisticsQuery = (params: GroupStatisticsParams) => {
  return useQuery({
    queryKey: ["groupStatistics", params.groupId, params.year ?? null, params.month ?? null],
    queryFn: () => fetchGroupStatistics(params),
    enabled: params.groupId > 0,
    retry: false,
  });
};
