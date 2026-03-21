import { Stack, Box } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {GroupGrid} from "./GroupGrid";
import {RecentActivity} from "./RecentActivity";
import {BigAddExpenseButton} from "../../components/BigAddExpenseButton";

export function HomePage() {

    return (
        <Box width="100%">
            <Stack sx = {{padding: '20px 0px 40px 0px'}} direction="row" justifyContent="space-between">
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
                    <BigAddExpenseButton variant={"h3"} />
                </Stack>
            </Stack>
        </Box>
    );
}