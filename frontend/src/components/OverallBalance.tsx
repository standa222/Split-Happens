import { useOverallBalanceQuery } from "../hooks/useOverallBalanceQuery";
import { Stack, Typography, Box } from "@mui/material";
import { COLORS } from "../constants/colors";
import { useAuthStore } from "../store/authStore";
import { FormattedMessage } from "react-intl";
import { formatMoneyWithSymbol } from "../utils/currencyUtils";

const Content = () => {
  const { data: groups, isLoading, isError } = useOverallBalanceQuery();
  const userId = useAuthStore((s) => s.currentUser.id);

  const responsiveTypography = {
    typography: { xs: "h6", md: "h4" },
  };

  if (isLoading) {
    return (
      <Typography sx={responsiveTypography}>
        <FormattedMessage id="overallBalance.loading" />
      </Typography>
    );
  }
  if (isError) {
    return (
      <Typography sx={responsiveTypography}>
        <FormattedMessage id="overallBalance.error" />
      </Typography>
    );
  }

  const balanceMap = groups.reduce((acc, { defaultCurrency, userDebts }) => {
    const currency = defaultCurrency;
    const netChange = userDebts.reduce((sum, debt) => {
      const isCreditor = userId === debt.creditor.id;
      return sum + (isCreditor ? debt.amount : -debt.amount);
    }, 0);

    acc.set(currency, (acc.get(currency) ?? 0) + netChange);
    return acc;
  }, new Map<string, number>());

  const balances = Array.from(balanceMap.entries())
    .filter(([, amount]) => Math.abs(amount) > 1e-6)
    .sort(([a], [b]) => {
      if (a === "CZK") return -1;
      if (b === "CZK") return 1;
      return a.localeCompare(b);
    })
    .map(([currency, amount]) => ({
      currency,
      amount,
    }));

  if (balances.length === 0) {
    return (
      <Typography sx={responsiveTypography}>
        <FormattedMessage id="overallBalance.settled" />
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="wrap">
      <Typography sx={responsiveTypography}>
        <FormattedMessage id="overallBalance.label" />
      </Typography>

      <Typography sx={responsiveTypography}>
        {balances.length === 0 ? (
          <Box component="span" sx={{ color: COLORS.PRIMARY }}>
            {formatMoneyWithSymbol(0, "USD")}
          </Box>
        ) : (
          balances.map((b, idx) => (
            <Box key={b.currency} component="span">
              {idx > 0 ? ", " : ""}
              <Box
                component="span"
                sx={{
                  color: b.amount < 0 ? COLORS.RED : COLORS.PRIMARY,
                  whiteSpace: "nowrap",
                }}
              >
                {formatMoneyWithSymbol(b.amount, b.currency)}
              </Box>
            </Box>
          ))
        )}
      </Typography>
    </Stack>
  );
};

export function OverallBalance() {
  return (
    <Stack direction="row" spacing={2}>
      <Content />
    </Stack>
  );
}
