import {useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../axios/axios";
import {useImageCacheBusterStore} from "../store/imageCacheBusterStore";

type Options = {
    onSuccess?: () => void;
};

export const useUploadUserImage = (options?: Options) => {
    const queryClient = useQueryClient();
    const bump = useImageCacheBusterStore((s) => s.bump);

    return useMutation<void, Error, File>({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            await api.post("/users/image", formData, {
                headers: {
                    // Let browser set boundary
                    "Content-Type": "multipart/form-data",
                },
            });
        },
        onSuccess: async () => {
            // 1) Ensure we generate a new URL (?v=timestamp) so we bypass any server/proxy caching.
            bump();
            // 2) Invalidate cached avatar query so ImageAvatar refetches.
            await queryClient.invalidateQueries({queryKey: ["userImage"], exact: false});

            options?.onSuccess?.();
        },
    });
};
