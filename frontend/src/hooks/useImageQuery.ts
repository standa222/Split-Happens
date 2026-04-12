import {useQuery} from "@tanstack/react-query";
import {api} from "../axios/axios";

export type ImageQueryResult = {
    blob: Blob | null;
    contentType: string | null;
};

const fetchImage = async (url: string): Promise<ImageQueryResult> => {
    const res = await api.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
        validateStatus: (status) => status === 200 || status === 204,
    });

    if (res.status === 204) {
        return {blob: null, contentType: null};
    }

    const contentType = (res.headers?.["content-type"] as string | undefined) ?? "image/webp";
    const blob = new Blob([res.data], {type: contentType});
    return {blob, contentType};
};

export const useImageQuery = (key: unknown[], url: string | null | undefined) => {
    return useQuery({
        queryKey: [...key, url],
        queryFn: () => fetchImage(url as string),
        enabled: !!url,
        retry: false,
        staleTime: 24 * 60 * 60_000,
        gcTime: 24 * 60 * 60_000,
        refetchOnWindowFocus: false,
    });
};

export const useUserImageQuery = (userId: number | null | undefined) => {
    const url = typeof userId === "number" && userId > 0 ? `/users/${userId}/image` : null;
    return useImageQuery(["userImage"], url);
};

export const useGroupImageQuery = (groupId: number | null | undefined) => {
    const url = typeof groupId === "number" && groupId > 0 ? `/groups/${groupId}/image` : null;
    return useImageQuery(["groupImage"], url);
};

