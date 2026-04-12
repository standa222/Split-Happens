import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";

type Options = {
    onSuccess?: () => void;
};

export function useDeleteExpense(options?: Options) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { transactionId: number; groupId: number }>({
        mutationFn: ({ transactionId }) => api.delete(`/transactions/${transactionId}`).then((res) => res.data),
        onSuccess: (_, variables) => {
            console.log("Expense deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
            options?.onSuccess?.();
        },
        onError: (error) => console.error("Error deleting expense:", error),
    });
}

