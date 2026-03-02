import { Stack } from "@mui/material";
import {GroupList} from "./GroupList";
import {RecentActivity} from "./RecentActivity";
import {BigAddExpenseButton} from "./BigAddExpenseButton";


export function HomePageContent() {
    return (
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
    );
}