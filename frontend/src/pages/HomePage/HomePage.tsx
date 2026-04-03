import { Stack, Box } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {GroupGrid} from "./GroupGrid";
import {RecentActivity} from "./RecentActivity";
import {AddExpenseButton} from "../../components/AddExpenseButton";

export function HomePage() {

    return (
        <Box width="100%">
            <Stack
                sx={{
                    py: { xs: 2, sm: 2.5, md: 2.5 },
                    mb: { xs: 2, sm: 3, md: 4 },
                }}
                direction="row"
                justifyContent="space-between"
            >
                <OverallBalance />
            </Stack>
            <Stack
                width="100%"
                direction={{ xs: "column", md: "row" }}
                gap={{ xs: 3, md: 10 }}
                alignItems={{ xs: "stretch", md: "flex-start" }}
            >
                <Box sx={{ flex: 2, minWidth: 0 }}>
                    <GroupGrid/>
                </Box>

                <Stack sx={{ flex: 1 }} gap={{ xs: 3, md: 4 }}>
                    <RecentActivity />
                    <AddExpenseButton variant={{ xs: "h5", sm: "h4", md: "h3" }} />
                </Stack>
            </Stack>
        </Box>
    );
}