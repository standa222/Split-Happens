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
            }}
        >
            <Stack
                width="80%"
            >
                <Navigation />
                <Box>
                    <Outlet />
                </Box>
            </Stack>
        </Stack>
    );
}