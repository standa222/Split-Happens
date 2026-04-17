import {TUser} from "./TUser";

export type TTransaction = {
    id: number;
    title: string;
    totalAmount: number;
    createdAt: string;
    transactionType: 'EXPENSE' | 'PAYMENT';
    items: {
        id: number;
        user: TUser;
        balanceChange: number;
    }[];
    currency: string;
    expenseCategory: string | null;
}