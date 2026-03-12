import {useOverallBalanceQuery} from "../hooks/useOverallBalanceQuery";
import { Stack, Typography } from "@mui/material";
import {COLORS} from "../constants/colors";
import {useAuthStore} from "../store/authStore";

const Content = () => {
    const { data: groups, isLoading, isError } = useOverallBalanceQuery();

    if (isLoading) {
        return (
            <Typography variant="h3">
                Your overall balance is: Loading...
            </Typography>
        )
    }
    if (isError) {
        return (
            <Typography variant="h3">
                Error loading your overall balance.
            </Typography>
        )
    }
    const userId = useAuthStore.getState().currentUser.id
    const balance = groups.flatMap(group => group.userDebts).reduce((acc, debt) => {
        return userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount;
    }, 0);

    return (
        <Stack direction="row" spacing={2}>
            <Typography variant="h3">
                Your overall balance is:
            </Typography>
            <Typography variant="h3"
                        sx = {{
                            // fontWeight: 700,
                            color: balance < 0 ? COLORS.RED : "inherit",
                        }}
            >
                {balance.toFixed(2)} $
            </Typography>
        </Stack>
    )
}

export function OverallBalance() {
    return (
        <Stack
            direction="row"
            spacing={2}
        >
            <Content />
        </Stack>
    );
}