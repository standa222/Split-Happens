import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../axios/axios";

type SettleDebtVariables = {
  groupId: number;
  debtId: number;
};

export function useSettleDebt() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SettleDebtVariables>({
    mutationFn: ({ debtId }) => api.delete(`/debts/${debtId}`).then(() => undefined),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["groupDetail", variables.groupId] });
    },
    onError: (error) => console.error("Error settling debt:", error),
  });
}
