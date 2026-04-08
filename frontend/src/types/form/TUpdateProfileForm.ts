import { z } from "zod";

const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const updateProfileFormSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    bankAccount: z
        .object({
            prefix: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
            accountNumber: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
            bankCode: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
        })
        .optional()
        .transform((ba) => {
            if (!ba) return undefined;
            const allEmpty = !ba.prefix && !ba.accountNumber && !ba.bankCode;
            return allEmpty ? undefined : ba;
        })
        .refine((ba) => !ba || (!!ba.accountNumber && !!ba.bankCode), {
            message: "Provide account number and bank code (prefix is optional)",
        }),
});

export type TUpdateProfileForm = z.infer<typeof updateProfileFormSchema>;

