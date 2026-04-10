import { z } from "zod";

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const updateProfileFormSchema = z.object({
    firstName: z.string().trim().min(1, "validation.required.firstName"),
    lastName: z.string().trim().min(1, "validation.required.lastName"),
    bankAccount: z
        .object({
            prefix: z.preprocess(
                emptyToUndefined,
                z.string().trim().regex(/^\d+$/, "validation.bankAccount.digitsOnly").optional()
            ),
            accountNumber: z.preprocess(
                emptyToUndefined,
                z.string().trim().regex(/^\d+$/, "validation.bankAccount.digitsOnly").optional()
            ),
            bankCode: z.preprocess(
                emptyToUndefined,
                z.string().trim().regex(/^\d{4}$/, "validation.bankAccount.fourDigits").optional()
            ),
        })
        .optional()
        .transform((ba) => {
            if (!ba) return undefined;
            const allEmpty = !ba.prefix && !ba.accountNumber && !ba.bankCode;
            return allEmpty ? undefined : ba;
        })
        .superRefine((ba, ctx) => {
            if (ba && (!ba.accountNumber || !ba.bankCode)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "validation.bankAccount.accountNumberAndBankCodeRequired",
                    path: ["accountNumber"],
                });
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "validation.bankAccount.accountNumberAndBankCodeRequired",
                    path: ["bankCode"],
                });
            }
        }),
});

export type TUpdateProfileForm = z.infer<typeof updateProfileFormSchema>;
