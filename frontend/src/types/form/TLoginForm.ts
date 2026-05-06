import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, "validation.required.email").email("validation.email.invalid"),
  password: z.string().min(1, "validation.required.passwordLogin"),
});

export type TLoginForm = z.infer<typeof loginFormSchema>;
