import { z } from "zod";

export const createGroupFormSchema = z.object({
  name: z.string().trim().min(1, "validation.group.nameRequired"),
  defaultCurrency: z.string().trim().length(3, "validation.group.currencyCodeRequired"),
  permissionMode: z.enum(["SOFT", "HARD"]),
  groupType: z.enum(["GROUP", "FRIEND"]),
  memberIds: z.array(z.number()).min(1, "validation.group.membersNotEmpty"), // user IDs
});

export type TCreateGroupForm = z.infer<typeof createGroupFormSchema>;
