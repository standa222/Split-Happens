import {Box, Button, Collapse, Divider, Stack, Typography } from "@mui/material";
import {TTransaction} from "../../types/TTransaction";
import { COLORS } from "../../constants/colors";
import {useAuthStore} from "../../store/authStore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {useState} from "react";

type Props = {
    transactions: TTransaction[];
}

const TransactionRow= ({ transaction }: { transaction: TTransaction }) => {
    const userId = useAuthStore.getState().currentUser.id
    const userSplit = transaction.items.filter(item => item.user.id === userId)[0]?.balanceChange || 0;
    const isNegative = userSplit < 0;
    const paidBy = transaction.items.find(item => item.balanceChange > 0)?.user.id || 0;

    return (
        <>
            <Stack direction="row" alignItems="center" py={1.5} spacing={2}>
                {/*<Box sx={{ color: COLORS.PRIMARY, width: 40, display: "flex", justifyContent: "center" }}>*/}
                {/*    {getCategoryIcon(transaction.category)}*/}
                {/*</Box>*/}

                {transaction.transactionType === 'payment' ? (
                    <Box flex={1}>
                        <Typography fontWeight="bold" color={COLORS.PRIMARY}>
                            {transaction.title}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box flex={1}>
                            <Typography fontWeight="bold" color={COLORS.PRIMARY}>
                                {transaction.title}
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={isNegative ? "error.main" : "success.main"}
                            >
                                your split: {isNegative ? "" : ""}{userSplit.toFixed(2)} $
                            </Typography>
                        </Box>

                        <Box textAlign="right" sx={{ minWidth: 180 }}>
                            <Typography color={COLORS.PRIMARY}>
                                total paid: {transaction.totalAmount.toFixed(2)} $
                            </Typography>
                            <Typography variant="body2" color={COLORS.PRIMARY}>
                                paid by: {paidBy}
                            </Typography>
                        </Box>
                    </>
                )}

                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        borderRadius: 5,
                        backgroundColor: COLORS.PRIMARY,
                        color: COLORS.SECONDARY,
                        fontWeight: "bold",
                        textTransform: "none",
                        minWidth: 80,
                    }}
                >
                    Detail
                </Button>
            </Stack>
            <Divider />
        </>
    );
};

const MonthSection = ({ month, transactions }: { month: string; transactions: TTransaction[] }) => {
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
                    <TransactionRow key={t.id} transaction={t} />
                ))}
            </Collapse>
        </Box>
    );
};

export const GroupExpenses = ({ transactions }: Props) => {
    const groupTransactionsByMonth = transactions.reduce((acc, transaction) => {
        const month = new Date(transaction.createdAt).toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
        if (!acc[month]) acc[month] = [];
        acc[month].push(transaction);
        return acc;
    }, {} as Record<string, TTransaction[]>);

    return (
        <Box>
            {Object.entries(groupTransactionsByMonth).map(([month, txs]) => (
                <MonthSection key={month} month={month} transactions={txs} />
            ))}
        </Box>
    );
};