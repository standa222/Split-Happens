import {TGroupLight} from "../types/dto/TGroupLight";
import {Typography} from "@mui/material";
import {COLORS} from "../constants/colors";

export const DebtsList = ({ userDebts }: { userDebts: TGroupLight['userDebts'] }) => {
    if (userDebts.length === 0) {
        return <Typography variant="body1">You are settled in this group.</Typography>;
    } else {
        return (
            userDebts.map(debt => (
                <Typography variant="body1" key={debt.id} sx={{ color: debt.amount < 0 ? COLORS.RED : COLORS.PRIMARY }}>
                    {debt.amount.toFixed(2)} $
                </Typography>
            ))
        )
    }
}