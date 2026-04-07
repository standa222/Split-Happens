import {Box, Divider, Stack, Typography} from "@mui/material";
import {FormattedMessage} from "react-intl";
import {TTransaction} from "../../types/TTransaction";
import {COLORS} from "../../constants/colors";
import {useAuthStore} from "../../store/authStore";
import { formatMoneyWithSymbol } from "../../utils/currencyUtils";

type Props = {
    transaction: TTransaction | null;
};

export const ExpenseDetailView = ({ transaction }: Props) => {
    const userId = useAuthStore((s) => s.currentUser.id);

    if (!transaction) {
        return (
            <Typography color={COLORS.PRIMARY}>
                <FormattedMessage id="expense.detail.empty" />
            </Typography>
        );
    }

    const userSplit = transaction.items
        .filter((item) => item.user.id === userId)
        .reduce((acc, item) => acc + item.balanceChange, 0);

    const isNegative = userSplit < 0;

    const paidBy = transaction.items
        .filter((item) => item.balanceChange > 0)
        .sort((a, b) => b.balanceChange - a.balanceChange)
        .map((item) => ({ name: item.user.firstName, amount: item.balanceChange }));

    const splitBetween = transaction.items
        .filter((item) => item.balanceChange < 0)
        .sort((a, b) => a.balanceChange - b.balanceChange)
        .map((item) => ({ name: item.user.firstName, amount: Math.abs(item.balanceChange) }));

    return (
        <Box sx={{ px: 2, pb: 2, backgroundColor: COLORS.SECONDARY }}>
            <Stack gap={2}>
                <Stack gap={0.5}>
                    <Typography sx={{ fontWeight: 800, color: COLORS.PRIMARY, fontSize: 20 }}>
                        {transaction.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.PRIMARY }}>
                        <FormattedMessage id="expense.detail.createdAt" />: {new Date(transaction.createdAt).toLocaleString()}
                    </Typography>
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} gap={3}>
                    <Stack flex={1} gap={0.5}>
                        <Typography sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                            <FormattedMessage id="expense.detail.total" />
                        </Typography>
                        <Typography sx={{ color: COLORS.PRIMARY }}>
                            {formatMoneyWithSymbol(transaction.totalAmount, transaction.currency)}
                        </Typography>
                    </Stack>

                    <Stack flex={1} gap={0.5}>
                        <Typography sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                            <FormattedMessage id="expense.detail.yourSplit" />
                        </Typography>
                        <Typography sx={{ fontWeight: 800, color: isNegative ? COLORS.RED : COLORS.PRIMARY }}>
                            {formatMoneyWithSymbol(userSplit, transaction.currency)}
                        </Typography>
                    </Stack>

                    <Stack flex={1} gap={0.5}>
                        <Typography sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                            <FormattedMessage id="expense.detail.type" />
                        </Typography>
                        <Typography sx={{ color: COLORS.PRIMARY }}>
                            <FormattedMessage
                                id={transaction.transactionType === "PAYMENT" ? "expense.detail.type.payment" : "expense.detail.type.expense"}
                            />
                        </Typography>
                    </Stack>
                </Stack>

                <Divider />

                <Stack direction={{ xs: "column", sm: "row" }} gap={3}>
                    <Stack flex={1} gap={1}>
                        <Typography sx={{ fontWeight: 800, color: COLORS.PRIMARY }}>
                            <FormattedMessage id="expense.detail.paidBy" />
                        </Typography>
                        {paidBy.length === 0 ? (
                            <Typography variant="body2" sx={{ color: COLORS.PRIMARY }}>
                                <FormattedMessage id="expense.detail.none" />
                            </Typography>
                        ) : (
                            <Stack gap={0.75}>
                                {paidBy.map((p) => (
                                    <Stack key={`${p.name}-${p.amount}`} direction="row" justifyContent="space-between" gap={2}>
                                        <Typography sx={{ color: COLORS.PRIMARY }}>
                                            {p.name}
                                        </Typography>
                                        <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 800 }}>
                                            {formatMoneyWithSymbol(p.amount, transaction.currency)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Stack>

                    <Stack flex={1} gap={1}>
                        <Typography sx={{ fontWeight: 800, color: COLORS.PRIMARY }}>
                            <FormattedMessage id="expense.detail.splitBetween" />
                        </Typography>
                        {splitBetween.length === 0 ? (
                            <Typography variant="body2" sx={{ color: COLORS.PRIMARY }}>
                                <FormattedMessage id="expense.detail.none" />
                            </Typography>
                        ) : (
                            <Stack gap={0.75}>
                                {splitBetween.map((s) => (
                                    <Stack key={`${s.name}-${s.amount}`} direction="row" justifyContent="space-between" gap={2}>
                                        <Typography sx={{ color: COLORS.PRIMARY }}>
                                            {s.name}
                                        </Typography>
                                        <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 800 }}>
                                            {formatMoneyWithSymbol(s.amount, transaction.currency)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    );
};
