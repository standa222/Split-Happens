import {TUser} from "./TUser";

export type TDebt = {
    amount: number;
    creditor: TUser;
    debtor: TUser;
}