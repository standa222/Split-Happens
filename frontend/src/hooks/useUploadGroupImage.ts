import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {useImageCacheBusterStore} from "../store/imageCacheBusterStore";

type Options = {
  onSuccess?: () => void;
};

export const useUploadGroupImage = (groupId: number, options?: Options) => {
    const queryClient = useQueryClient();
    const bump = useImageCacheBusterStore((s) => s.bump);

    return useMutation<void, Error, File>({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            await api.post(`/groups/${groupId}/image`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: async () => {
            bump();
            await queryClient.invalidateQueries({ queryKey: ["groupImage"], exact: false });
            options?.onSuccess?.();
        },
    });
};
