import { Stack, Typography, Box, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from "../../constants/colors";

export function BigAddExpenseButton({ onClick }: { onClick?: () => void }) {
    return (
        <Stack
            component="button" // Makes the whole Stack semantically a button
            onClick={onClick}
            alignItems="center"
            spacing={2}
            sx={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "20px",
                width: "100%",
                transition: "transform 0.1s ease-in-out",
                "&:hover": {
                    transform: "scale(1.05)", // Subtle feedback when hovering
                },
                "&:active": {
                    transform: "scale(0.95)",
                },
            }}
        >
            <Typography
                variant="h3"
                sx={{
                    color: COLORS.PRIMARY,
                    fontWeight: 500,
                    textAlign: "center",
                }}
            >
                Add expense
            </Typography>
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    backgroundColor: COLORS.PRIMARY,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                }}
            >
                <AddIcon sx={{ color: COLORS.SECONDARY, fontSize: 50 }} />
            </Box>
        </Stack>
    );
}