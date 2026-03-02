import { Stack } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {GroupList} from "./GroupList";
import {RecentActivity} from "./RecentActivity";
import {BigAddExpenseButton} from "./BigAddExpenseButton";

export function HomePage() {
    return (
        <Stack
            width="100%"
        >
            <OverallBalance />
            <Stack
                width="100%"
                direction="row"
            >
                <GroupList />
                <Stack>
                    <RecentActivity />
                    <BigAddExpenseButton />
                </Stack>
            </Stack>
        </Stack>
    );
}