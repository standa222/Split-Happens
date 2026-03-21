import { z } from "zod";

export const registerFormSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    password: z.string(),
});

export type TRegisterForm = z.infer<typeof registerFormSchema>;