import { z } from "zod";

// Backend expects camelCase: UserCreateDto.bankAccount
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const registerFormSchema = z.object({
  firstName: z.string().trim().min(1, "validation.required.firstName"),
  lastName: z.string().trim().min(1, "validation.required.lastName"),
  email: z.string().trim().email("validation.email.invalid"),
  password: z.string().min(6, "validation.required.password"),
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
        z
          .string()
          .trim()
          .regex(/^\d{4}$/, "validation.bankAccount.fourDigits")
          .optional()
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

export type TRegisterForm = z.infer<typeof registerFormSchema>;
