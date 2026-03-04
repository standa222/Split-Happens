import {TDebt} from "../TDebt";

export type TGroupLight = {
    id: number;
    name: string;
    userDebts: TDebt[];
    lastActivity: string;
}