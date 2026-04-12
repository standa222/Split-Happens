import {Box, SxProps, Theme} from "@mui/material";
import {useEffect, useMemo, useState} from "react";
import {useGroupImageQuery, useUserImageQuery} from "../hooks/useImageQuery";
import {ImagePlaceholder, ImagePlaceholderShape} from "./ImagePlaceholder";

export type ImageAvatarType = "user" | "group";

export type ImageAvatarProps = {
    type: ImageAvatarType;
    id: number;
    width?: any;
    height?: any;
    shape?: ImagePlaceholderShape;
    iconSize?: any;
    sx?: SxProps<Theme>;
    imgSx?: SxProps<Theme>;
};

export const ImageAvatar = ({
    type,
    id,
    width = {xs: 60, md: 120},
    height = {xs: 60, md: 120},
    shape = "circle",
    iconSize = 24,
    sx,
    imgSx,
}: ImageAvatarProps) => {
    const query = type === "group" ? useGroupImageQuery(id) : useUserImageQuery(id);
    const {data, isLoading, isError} = query;

    const [imgUrl, setImgUrl] = useState<string | null>(null);

    const combinedImgSx = useMemo(() => {
        const base: SxProps<Theme> = {
            width,
            height,
            borderRadius: shape === "circle" ? "50%" : "20px",
            border: "2px solid transparent",
            objectFit: "cover",
            display: "block",
            flexShrink: 0,
            overflow: "hidden",
        };

        return [base, sx, imgSx].filter(Boolean) as unknown as SxProps<Theme>;
    }, [width, height, shape, sx, imgSx]);

    useEffect(() => {
        if (!data?.blob) {
            setImgUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            return;
        }

        const nextUrl = URL.createObjectURL(data.blob);
        setImgUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return nextUrl;
        });

        return () => {
            URL.revokeObjectURL(nextUrl);
        };
    }, [data?.blob]);

    const showPlaceholder = isLoading || isError || !imgUrl;

    if (showPlaceholder) {
        return (
            <ImagePlaceholder
                width={width}
                height={height}
                shape={shape}
                iconSize={iconSize}
                sx={sx}
            />
        );
    }

    return (
        <Box
            component="img"
            src={imgUrl}
            alt=""
            onError={() => {
                setImgUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                });
            }}
            sx={combinedImgSx}
        />
    );
};
