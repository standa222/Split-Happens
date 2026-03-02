import { Stack, Box } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {GroupGrid} from "./GroupGrid";
import {RecentActivity} from "./RecentActivity";
import {BigAddExpenseButton} from "./BigAddExpenseButton";

export function HomePage() {

    return (
        <Box width="100%">
            <Stack direction="row" justifyContent="space-between">
                <OverallBalance />
            </Stack>
            <Stack
                width="100%"
                direction="row"
                gap={10}
            >
                <Box sx = {{ flex: 2 }}>
                    <GroupGrid/>
                </Box>
                <Stack sx = {{ flex: 1 }} gap={4}>
                    <RecentActivity />
                    <BigAddExpenseButton />
                </Stack>
            </Stack>
        </Box>
    );
}