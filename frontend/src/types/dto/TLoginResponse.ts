import { TUser } from "../TUser";

export type TLoginResponse = {
  token: string;
  user: TUser;
}