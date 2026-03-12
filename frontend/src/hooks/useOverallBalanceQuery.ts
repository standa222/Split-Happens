import {api} from "../axios/axios";
import {useQuery} from "@tanstack/react-query";
import {TGroupLight} from "../types/dto/TGroupLight";

const fetchOverallBalance = async (): Promise<TGroupLight[]> => {
    const { data } = await api.get('/groups')
    return data;
}

export const useOverallBalanceQuery = () => {
    return useQuery({
        queryKey: ['overallBalance'],
        queryFn: fetchOverallBalance,
        retry: false,
    });
}