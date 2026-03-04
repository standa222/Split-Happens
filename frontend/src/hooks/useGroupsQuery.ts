import {useQuery} from "@tanstack/react-query";
import {TGroupLight} from "../types/dto/TGroupLight";
import {api} from "../axios/axios";

export type GroupsByActivity = {
    activeGroups: TGroupLight[];
    inactiveGroups: TGroupLight[];
}

const fetchGridGroups = async (): Promise<TGroupLight[]> => {
    const { data } = await api.get('/groups');
    console.log("grid groups", data);
    return data;
}

export const useGroupsGridQuery = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: fetchGridGroups,
        retry: false,
    })
}

const fetchGroups = async (): Promise<GroupsByActivity> => {
    const { data } = await api.get('/groups');
    console.log("groups", data);
    return groupActiveAndInactive(data);
}

export const useGroupsQuery = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: fetchGroups,
        retry: false,
    })
}

const groupActiveAndInactive = (groups: TGroupLight[]) => {
    const monthMillis = 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - monthMillis;

    const activeGroups = groups.filter(group => {
        const hasNonZeroDebt = group.userDebts.some(debt => debt.amount !== 0);
        const isRecentlyActive = new Date(group.lastActivity).getTime() > thirtyDaysAgo;

        return hasNonZeroDebt || isRecentlyActive;
    });

    const inactiveGroups = groups.filter(group => {
        const allDebtsZero = group.userDebts.every(debt => debt.amount === 0);
        const isOldActivity = new Date(group.lastActivity).getTime() <= thirtyDaysAgo;

        return allDebtsZero && isOldActivity;
    });

    return {activeGroups, inactiveGroups};
}

const monthMillis = 30 * 24 * 60 * 60 * 1000; // Approximate month in milliseconds