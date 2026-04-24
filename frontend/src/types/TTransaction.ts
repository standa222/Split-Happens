import {TUser} from "./TUser";

export type TTransactionSplitMode = 'FIXED' | 'PERCENTAGE' | 'PARTIAL';

export type TTransaction = {
    id: number;
    title: string;
    totalAmount: number;
    createdAt: string;
    transactionType: 'EXPENSE' | 'PAYMENT';

    paidByMode: TTransactionSplitMode;
    splitBetweenMode: TTransactionSplitMode;

    items: {
        id: number;
        user: TUser;
        balanceChange: number;
        defaultCurrencyBalanceChange: number;
        filledValue: number;
    }[];

    currency: string;
    expenseCategory: string | null;
}