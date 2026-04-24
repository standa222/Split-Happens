import { z } from "zod";

export const addExpenseFormSchema = z.object({
    title: z.string().trim().min(1, "validation.requiredField"),
    expenseCategory: z.string().trim().min(1, "validation.requiredField"),
    groupId: z.number().min(1, "validation.requiredField"),
    totalAmount: z.number().min(1, "validation.requiredField"),
    currency: z.string().trim().min(1, "validation.requiredField"),

    // Backend expects modes on the transaction and a single filledValue per split row.
    paidByMode: z.enum(["FIXED", "PERCENTAGE", "PARTIAL"]),
    splitBetweenMode: z.enum(["FIXED", "PERCENTAGE", "PARTIAL"]),

    paidBy: z.array(
        z.object({
            userId: z.number(),
            filledValue: z.number(),
        }),
    ),
    splitBetween: z.array(
        z.object({
            userId: z.number(),
            filledValue: z.number(),
        }),
    ),

    transactionType: z.enum(["EXPENSE", "PAYMENT"]),
});

export type TAddExpenseForm = z.infer<typeof addExpenseFormSchema>;