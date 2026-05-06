import { TUser } from "./TUser";

export type TDebt = {
  id: number;
  amount: number;
  creditor: TUser;
  debtor: TUser;
};
