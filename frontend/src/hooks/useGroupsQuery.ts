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
    return {activeGroups: groups, inactiveGroups: groups}; // TODO delete after BE returns lastActivity
    const activeGroups = groups.filter(group => group.debts.some(debt => debt.amount !== 0) || group.lastActivity > Date.now() - monthMillis); // Active if has non-zero debts or activity in last 30 days
    const inactiveGroups = groups.filter(group => group.debts.every(debt => debt.amount === 0) && group.lastActivity <= Date.now() - monthMillis); // Inactive if all debts are zero and no activity in last 30 days
    console.log("actve", activeGroups);
    console.log("inactive", inactiveGroups);
    return {activeGroups, inactiveGroups};
}

const monthMillis = 30 * 24 * 60 * 60 * 1000; // Approximate month in milliseconds