import { z } from "zod";

export const addExpenseFormSchema = z.object({
    title: z.string().trim().min(1, "validation.requiredField"),
    category: z.string().trim().min(1, "validation.requiredField"),
    groupId: z.number().min(1, "validation.requiredField"),
    totalAmount: z.number().min(1, "validation.requiredField"),
    currency: z.string().trim().min(1, "validation.requiredField"),
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