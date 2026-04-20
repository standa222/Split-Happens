import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {TTransaction} from "../types/TTransaction";
import {TAddExpenseForm} from "../types/form/TAddExpenseForm";
import type { AxiosError } from "axios";

type Options = {
    onSuccess?: () => void;
    onError?: () => void;
};

export function useEditExpense(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation<TTransaction, AxiosError, { transactionId: number; data: TAddExpenseForm }>({
        mutationFn: ({ transactionId, data }) => api.put(`/transactions/${transactionId}`, data).then((res) => res.data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.data.groupId] });
            options?.onSuccess?.();
        },
        onError: (error) => {
            console.error("Error updating expense:", error);
            options?.onError?.();
        },
    });
}
