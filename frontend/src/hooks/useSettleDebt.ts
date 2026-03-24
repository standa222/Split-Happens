import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {TDebt} from "../types/TDebt";

export function useSettleDebt() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, TDebt>({
        mutationFn: (debt) => api.delete(`/debts/${debt.id}/`),
        onSuccess: (data, variables) => {
            console.log('Debt settled successfully');
            queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
        },
        onError: (error) => console.error('Error settling debt:', error)
    })
}