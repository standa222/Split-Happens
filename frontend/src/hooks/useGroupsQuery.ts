import {useQuery} from "@tanstack/react-query";
import {TGroupLight} from "../types/dto/TGroupLight";
import {api} from "../axios/axios";

const fetchGroups = async (): Promise<TGroupLight[]> => {
    const { data } = await api.get('/groups');
    console.log("groups", data);
    return data;
}

export const useGroupsQuery = () => {
    return useQuery({
        queryKey: ['groups'],
        queryFn: fetchGroups,
        retry: false,
    })
}