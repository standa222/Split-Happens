import {Box, Button, Collapse, Divider, Stack, Typography } from "@mui/material";
import {TTransaction} from "../../types/TTransaction";
import { COLORS } from "../../constants/colors";
import {useAuthStore} from "../../store/authStore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {useState} from "react";
import { FormattedMessage } from "react-intl";
import {ExpenseDetailModal} from "./ExpenseDetailModal";
import {TGroupDetail} from "../../types/dto/TGroupDetail";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {getCurrencySymbol} from "../../utils/currencyUtils";
import {getCategoryIcon} from "../../utils/categoryUtils";

type Props = {
    transactions: TTransaction[];
    group: TGroupDetail;
}

const PaidBy = ( { payers }: { payers: string[] }) => {
    if (payers.length === 0) return null;
    if (payers.length === 1) {
        return (
            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
                <FormattedMessage id="groupDetail.expenses.paidBy" />: {payers[0]}
            </Typography>
        );
    } else {
        return (
        <Typography variant="body2" color={COLORS.PRIMARY} sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
            <FormattedMessage id="groupDetail.expenses.paidBy" />: {payers[0]} + {payers.length - 1}
        </Typography>
        );
    }
}

const PaymentMessage = ({ transaction }: { transaction: TTransaction }) => {
    const currentUserId = useAuthStore((s) => s.currentUser.id);
    const currencySymbol = getCurrencySymbol(transaction.currency);

    // In PAYMENT transactions, one side is positive (creditor receiving), the other negative (debtor paying).
    const creditorItem = transaction.items
        .filter((i) => i.balanceChange < 0)[0];
    const debtorItem = transaction.items
        .filter((i) => i.balanceChange > 0)[0];

    const amount = Math.abs(debtorItem?.balanceChange ?? transaction.totalAmount ?? 0);
    const debtorName = debtorItem?.user.firstName ?? "";
    const creditorName = creditorItem?.user.firstName ?? "";
    const debtorIsCurrent = (debtorItem?.user.id ?? -1) === currentUserId;
    const creditorIsCurrent = (creditorItem?.user.id ?? -1) === currentUserId;

    return (
        <Typography
            color={COLORS.PRIMARY}
            sx={{
                typography: {xs: "body2", md: "body1"},
                fontWeight: {xs: 600, md: 700},
            }}
        >
            <FormattedMessage
                id="groupDetail.expenses.paymentLine"
                values={{
                    debtorIsCurrent,
                    debtorName,
                    creditorIsCurrent,
                    creditorName,
                    amount: amount.toFixed(2),
                    currencySymbol,
                }}
            />
        </Typography>
    )
}

const TransactionRow= ({ transaction, onOpenDetail }: { transaction: TTransaction; onOpenDetail?: (t: TTransaction) => void }) => {
    const userId = useAuthStore((s) => s.currentUser.id)
    const userSplit = transaction.items
        .filter(item => item.user.id === userId)
        .reduce((acc, item) => acc + item.balanceChange, 0);
    const isNegative = userSplit < 0;
    const paidBy = transaction.items
        .filter((item) => item.balanceChange > 0)
        .sort((a, b) => b.balanceChange - a.balanceChange)
        .map((item) => item.user.firstName);
    const currencySymbol = getCurrencySymbol(transaction.currency);

    return (
        <>
            <Stack direction="row" alignItems="center" py={1.5} gap={2}>
                <Box sx={{ color: COLORS.PRIMARY, display: "flex", justifyContent: "center", width: {xs: 30, md: 40}, heigh: {xs: 30, md: 40} }}>
                    {getCategoryIcon(transaction)}
                </Box>

                {transaction.transactionType === 'PAYMENT' ? (
                    <Box flex={1} sx={{ px: { md: 5 } }}>
                        <PaymentMessage transaction={transaction} />
                    </Box>
                ) : (
                    <>
                        <Stack direction="row" flex={1} sx={{ px: { md: 5 } }} gap={1}>
                            <Stack width="55%" gap={1}>
                                <Typography fontWeight="bold" color={COLORS.PRIMARY} sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
                                    {transaction.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={isNegative ? COLORS.RED : COLORS.PRIMARY}
                                    sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}
                                >
                                    <FormattedMessage id="groupDetail.expenses.yourSplit" />: {userSplit.toFixed(2)} {currencySymbol}
                                </Typography>
                            </Stack>

                            <Stack width="45%" gap={1}>
                                <Typography color={COLORS.PRIMARY} sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
                                    <FormattedMessage id="groupDetail.expenses.totalPaid" />: {transaction.totalAmount.toFixed(2)} {currencySymbol}
                                </Typography>
                                <PaidBy payers={paidBy} />
                            </Stack>
                        </Stack>
                        <Button
                            variant="contained"
                            onClick={() => onOpenDetail?.(transaction)}
                            sx={{
                                borderRadius: { xs: "50%", md: 5 },
                                width: { xs: 30, md: "auto" },
                                height: { xs: 30, md: "auto" },
                                minWidth: { xs: 30, md: "auto" },
                                backgroundColor: COLORS.PRIMARY,
                                color: COLORS.SECONDARY,
                                textTransform: "none",
                                padding: { xs: 0, md: "6px 16px" },
                            }}
                        >
                            <Box component="span" sx={{ display: { xs: "none", md: "inline" }, mx: 1 }}>
                                <FormattedMessage id="groupDetail.expenses.detail" />
                            </Box>
                            <MoreHorizIcon sx={{ display: { xs: "block", md: "none" } }} />
                        </Button>
                    </>
                )}
            </Stack>
            <Divider />
        </>
    );
};

const MonthSection = ({ month, transactions, onOpenDetail }: { month: string; transactions: TTransaction[]; onOpenDetail?: (t: TTransaction) => void }) => {
    const [open, setOpen] = useState(true);

    return (
        <Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setOpen(!open)}
                sx={{ cursor: "pointer", py: 1 }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    <Typography fontWeight="bold" color={COLORS.PRIMARY}>
                        {month}
                    </Typography>
                </Stack>
            </Stack>
            <Divider />
            <Collapse in={open}>
                {transactions.map((t) => (
                    <TransactionRow key={t.id} transaction={t} onOpenDetail={onOpenDetail} />
                ))}
            </Collapse>
        </Box>
    );
};

export const GroupExpenses = ({ transactions, group }: Props) => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TTransaction | null>(null);

    const groupTransactionsByMonth = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.createdAt).toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
        if (!acc[month]) acc[month] = [];
        acc[month].push(transaction);
        return acc;
    }, {} as Record<string, TTransaction[]>);

    const onOpenDetail = (t: TTransaction) => {
        setSelectedTransaction(t);
        setDetailOpen(true);
    };

    return (
        <Box>
            {Object.entries(groupTransactionsByMonth).map(([month, txs]) => (
                <MonthSection key={month} month={month} transactions={txs} onOpenDetail={onOpenDetail} />
            ))}

            <ExpenseDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                transaction={selectedTransaction}
                group={group}
            />
        </Box>
    );
};