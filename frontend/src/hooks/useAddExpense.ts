import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";
import { TTransaction } from "../types/TTransaction";
import { TAddExpenseForm } from "../types/form/TAddExpenseForm";
import type { AxiosError } from "axios";

type Options = {
  onSuccess?: () => void;
  onError?: () => void;
};

export function useAddExpense(options?: Options) {
  const queryClient = useQueryClient();

  return useMutation<TTransaction, AxiosError, TAddExpenseForm>({
    mutationFn: (data) =>
      api.post("/transactions", data).then((res) => {
        return res.data;
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      options?.onError?.();
    },
  });
}
