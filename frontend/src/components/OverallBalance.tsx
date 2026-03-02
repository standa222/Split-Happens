import {useOverallBalanceQuery} from "../hooks/useOverallBalanceQuery";
import { Stack, Typography } from "@mui/material";
import {COLORS} from "../constants/colors";

export function OverallBalance() {
    const { data: balance, isLoading, isError } = useOverallBalanceQuery();

    const content = isLoading ? (
        <Typography variant="h3">
            Your overall balance is: Loading...
        </Typography>
    ) : isError ? (
        <Typography variant="h3">
            Error loading your overall balance.
        </Typography>
    ) : (
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
                {balance}
            </Typography>
        </Stack>
    );

    return (
        <Stack
            sx = {{padding: '20px 0px 40px 0px'}}
            direction="row"
            spacing={2}
        >
            {content}
        </Stack>
    );
}