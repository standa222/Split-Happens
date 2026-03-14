import {TGroupLight} from "../types/dto/TGroupLight";
import {Box, Typography} from "@mui/material";
import {COLORS} from "../constants/colors";
import {TDebt} from "../types/TDebt";

const YouOwe = ({ debt }: { debt: TDebt }) => {
    return (
        <Typography variant="body1" key={debt.id}>
            You owe {debt.creditor.firstName}
            <Box
                component="span"
                sx={{
                    ml: 1,
                    color: COLORS.RED
                }}
            >
                {debt.amount.toFixed(2)} $
            </Box>
        </Typography>
    )
}

const YouAreOwed = ({ debt }: { debt: TDebt }) => {
    return (
        <Typography variant="body1" key={debt.id}>
            {debt.debtor.firstName} owes you {debt.amount.toFixed(2)} $
        </Typography>
    )
}

export const DebtsList = ({ userDebts, userId }: { userDebts: TGroupLight['userDebts'], userId: number }) => {
    if (userDebts.length === 0) {
        return <Typography variant="body1">You are settled in this group.</Typography>;
    } else {
        return (
            userDebts.map(debt => (
                debt.debtor.id === userId ? <YouOwe debt={debt} /> : <YouAreOwed debt={debt} />
            ))
        )
    }
}