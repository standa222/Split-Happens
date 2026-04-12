import {Box, SxProps, Theme} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {COLORS} from "../constants/colors";

export type ImagePlaceholderShape = "circle" | "rounded";

export type ImagePlaceholderProps = {
    /** Placeholder container width. Accepts any MUI `sx` width value (number -> px). */
    width?: any;
    /** Placeholder container height. Accepts any MUI `sx` height value (number -> px). */
    height?: any;
    shape?: ImagePlaceholderShape;
    iconSize?: any;
    sx?: SxProps<Theme>;
}

export const ImagePlaceholder = ({
    width = {xs: 60, md: 120},
    height = {xs: 60, md: 120},
    shape = "circle",
    iconSize = 24,
    sx,
}: ImagePlaceholderProps) => {
    const borderRadius = shape === "circle" ? "50%" : "20px";

    return (
        <Box
            sx={{
                width,
                height,
                borderRadius,
                border: `2px dashed ${COLORS.PRIMARY}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                ...sx,
            }}
        >
            <PhotoCameraIcon sx={{color: COLORS.PRIMARY, fontSize: iconSize}} />
        </Box>
    );
};

