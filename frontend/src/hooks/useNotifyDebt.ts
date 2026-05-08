import {useMutation} from "@tanstack/react-query";
import {api} from "../axios/axios";

export function useNotifyDebt() {
  return useMutation<void, Error, { debtId: number }>({
    mutationFn: ({ debtId }) => api.post(`/debts/${debtId}/notify`).then(() => undefined),
    onError: (error: Error) => console.error("Error notifying debt:", error),
  });
}