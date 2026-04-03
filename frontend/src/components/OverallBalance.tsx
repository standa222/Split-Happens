import {useOverallBalanceQuery} from "../hooks/useOverallBalanceQuery";
import { Stack, Typography } from "@mui/material";
import {COLORS} from "../constants/colors";
import {useAuthStore} from "../store/authStore";
import { FormattedMessage } from "react-intl";

const Content = () => {
    const { data: groups, isLoading, isError } = useOverallBalanceQuery();
    const userId = useAuthStore((s) => s.currentUser.id)

    const responsiveTypography = {
        typography: { xs: 'h6', md: 'h3' }
    };

    if (isLoading) {
        return (
            <Typography sx={responsiveTypography}>
                <FormattedMessage id="overallBalance.loading" />
            </Typography>
        )
    }
    if (isError) {
        return (
            <Typography sx={responsiveTypography}>
                <FormattedMessage id="overallBalance.error" />
            </Typography>
        )
    }

    const balance = groups.flatMap(group => group.userDebts).reduce((acc, debt) => {
        return userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount;
    }, 0);

    return (
        <Stack direction="row" spacing={2}>
            <Typography sx={responsiveTypography}>
                <FormattedMessage id="overallBalance.label" />
            </Typography>
            <Typography
                sx = {{
                    color: balance < 0 ? COLORS.RED : "inherit",
                    ...responsiveTypography,
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