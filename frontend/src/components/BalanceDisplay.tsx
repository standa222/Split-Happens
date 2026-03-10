import {Typography, Box, TypographyVariant} from "@mui/material";
import {COLORS} from "../constants/colors";

type Props = {
    balance: number,
    variant?: TypographyVariant,
    sx?: object,
}

export const BalanceDisplay = ({ balance, variant, sx }: Props) => {
    const isNegative = balance < 0;

    return (
        <Typography variant={variant} sx={sx}>
            Your balance
            <Box
                component="span"
                sx={{
                    ml: 1,
                    color: isNegative ? COLORS.RED : COLORS.PRIMARY
                }}
            >
                {balance.toFixed(2)} $
            </Box>
        </Typography>
    );
};