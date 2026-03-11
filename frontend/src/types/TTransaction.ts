import {TUser} from "./TUser";

export type TTransaction = {
    id: number;
    title: string;
    amount: number;
    createdAt: string;
    transactionType: 'expense' | 'payment';
    items: {
        id: number;
        user: TUser;
        balanceChange: number;
    }[];
}