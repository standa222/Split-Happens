import { z } from "zod";

export const addExpenseFormSchema = z.object({
    name: z.string(),
    category: z.string(),
    groupId: z.number(),
    amount: z.number(),
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

});

export type TAddExpenseForm = z.infer<typeof addExpenseFormSchema>;