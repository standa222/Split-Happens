import {TDebt} from "../TDebt";

export type TGroupLight = {
    id: number;
    name: string;
    debts: TDebt[];
    lastActivity: number; // timestamp
}