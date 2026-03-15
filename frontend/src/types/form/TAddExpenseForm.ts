import { z } from "zod";

export const addExpenseFormSchema = z.object({
    title: z.string(),
    category: z.string(),
    groupId: z.number(),
    totalAmount: z.number(),
    currency: z.string(),
    paidBy: z.array(z.object({
        userId: z.number(),
        fixed: z.number().optional(),
        partial: z.number().optional(),
        percentage: z.number().optional(),
    })),
    splitBetween: z.array(z.object({
        userId: z.number(),
        fixed: z.number().optional(),
        partial: z.number().optional(),
        percentage: z.number().optional(),
    })),
    transactionType: z.enum(["EXPENSE", "PAYMENT"]),
});

export type TAddExpenseForm = z.infer<typeof addExpenseFormSchema>;