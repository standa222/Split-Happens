import type { TUser } from "../TUser";

export type TFriendDto = {
  /** The other user (the friend). */
  user: TUser;
  /** Group created for the friendship (optional, backend may provide it). */
  groupId: number;
};

