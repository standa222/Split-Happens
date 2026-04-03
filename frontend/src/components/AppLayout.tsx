import {Outlet} from "react-router-dom";
import {Navigation} from "./Navigation";
import { Stack, Box } from "@mui/material";
import { COLORS } from "../constants/colors";

export function AppLayout() {
    return (
        <Stack
            alignItems="center"
            sx = {{
                minHeight: "100vh",
                background: COLORS.SECONDARY,
                color: COLORS.PRIMARY,
                px: { xs: 2, sm: 3, md: 4 },
            }}
        >
            <Stack
                sx={{
                    width: "100%",
                    maxWidth: { xs: 720, md: 1200, lg: 1400 },
                }}
            >
                <Navigation />
                <Box sx={{ width: "100%" }}>
                    <Outlet />
                </Box>
            </Stack>
        </Stack>
    );
}