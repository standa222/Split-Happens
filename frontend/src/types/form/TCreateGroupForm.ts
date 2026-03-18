import {z} from "zod";

export const createGroupFormSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    defaultCurrency: z.string().length(3, "Currency code must be 3 characters"),
    permissionMode: z.enum(["SOFT", "HARD"]),
    groupType: z.enum(["GROUP", "FRIEND"]),
    memberIds: z.array(z.number()), // user IDs
})

export type TCreateGroupForm = z.infer<typeof createGroupFormSchema>;