import {TUser} from "../TUser";
import {TDebt} from "../TDebt";
import {TTransaction} from "../TTransaction";

export type TGroupDetail = {
    id: number;
    name: string;
    defaultCurrency: string;
    permissionMode: 'hard' | 'soft';
    groupType: 'group' | 'friend';
    members: TUser[];
    debts: TDebt[];
    transactions: TTransaction[];
}