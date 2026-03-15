import {useMutation} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {TTransaction} from "../types/TTransaction";
import {TAddExpenseForm} from "../types/form/TAddExpenseForm";

export function useAddExpense() {
    return useMutation<TTransaction, Error, TAddExpenseForm>({
        mutationFn: (data) => api.post('/transactions', data).then(res => res.data),
        onSuccess: (data) => console.log('Expense added successfully:', data),
        onError: (error) => console.error('Error adding expense:', error)
    })
}