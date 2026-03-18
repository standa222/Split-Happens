import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {TTransaction} from "../types/TTransaction";
import {TAddExpenseForm} from "../types/form/TAddExpenseForm";

type Options = {
    onSuccess?: () => void;
};

export function useAddExpense(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation<TTransaction, Error, TAddExpenseForm>({
        mutationFn: (data) => api.post('/transactions', data).then(res => res.data),
        onSuccess: (data, variables) => {
            console.log('Expense added successfully:', data);
            queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
            options?.onSuccess?.();
        },
        onError: (error) => console.error('Error adding expense:', error)
    })
}