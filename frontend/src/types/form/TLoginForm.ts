import { z } from "zod";

export type TLoginForm = {
    email: string;
    password: string;
};

export const loginFormSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export type TLoginFormSchema = z.infer<typeof loginFormSchema>;