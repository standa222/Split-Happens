import type { TUser } from "../TUser";

export type TFriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type TFriendRequestDto = {
  id: number;
  sender: TUser;
  receiver: TUser;
  status: TFriendRequestStatus;
  createdAt?: string;
};

