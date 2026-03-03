import {api} from "../axios/axios";
import {useQuery} from "@tanstack/react-query";

const fetchOverallBalance = async (): Promise<number> => {
    // const { data } = await api.get('/debts/balance')
    // return data;

    return Promise.resolve(20); // Placeholder value, replace with actual API call
}

export const useOverallBalanceQuery = () => {
    return useQuery({
        queryKey: ['overallBalance'],
        queryFn: fetchOverallBalance,
    });
}