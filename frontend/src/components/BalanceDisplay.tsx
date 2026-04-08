import {Typography, Box, TypographyVariant} from "@mui/material";
import {COLORS} from "../constants/colors";
import { FormattedMessage } from "react-intl";
import {getCurrencySymbol} from "../utils/currencyUtils";

type Props = {
    balance: number,
    variant?: TypographyVariant,
    sx?: object,
    currency?: string,
}

export const BalanceDisplay = ({ balance, variant, sx, currency }: Props) => {
    const isNegative = balance < 0;
    const symbol = getCurrencySymbol(currency);

    return (
        <Typography variant={variant} sx={{ color: COLORS.PRIMARY, ...sx}}>
            <FormattedMessage id="balance.label" />
            <Box
                component="span"
                sx={{
                    ml: 1,
                    color: isNegative ? COLORS.RED : COLORS.PRIMARY
                }}
            >
                {balance.toFixed(2)} {symbol}
            </Box>
        </Typography>
    );
};