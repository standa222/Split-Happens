import {
  Autocomplete,
  Badge,
  Box,
  Button,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TTransaction } from "../../types/TTransaction";
import { COLORS } from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ExpenseDetailModal } from "./ExpenseDetailModal";
import { TGroupDetail } from "../../types/dto/TGroupDetail";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { getCurrencySymbol } from "../../utils/currencyUtils";
import { categories, type Category, getCategoryIcon } from "../../utils/categoryUtils";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

type Props = {
  transactions: TTransaction[];
  group: TGroupDetail;
};

const PaidBy = ({ payers }: { payers: string[] }) => {
  if (payers.length === 0) return null;
  if (payers.length === 1) {
    return (
      <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
        <FormattedMessage id="groupDetail.expenses.paidBy" />: {payers[0]}
      </Typography>
    );
  } else {
    return (
      <Typography
        variant="body2"
        color={COLORS.PRIMARY}
        sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}
      >
        <FormattedMessage id="groupDetail.expenses.paidBy" />: {payers[0]} + {payers.length - 1}
      </Typography>
    );
  }
};

const PaymentMessage = ({ transaction }: { transaction: TTransaction }) => {
  const currentUserId = useAuthStore((s) => s.currentUser.id);
  const currencySymbol = getCurrencySymbol(transaction.currency);

  // In PAYMENT transactions, one side is positive (creditor receiving), the other negative (debtor paying).
  const creditorItem = transaction.items.filter((i) => i.balanceChange < 0)[0];
  const debtorItem = transaction.items.filter((i) => i.balanceChange > 0)[0];

  const amount = Math.abs(debtorItem?.balanceChange ?? transaction.totalAmount ?? 0);
  const debtorName = debtorItem?.user.firstName ?? "";
  const creditorName = creditorItem?.user.firstName ?? "";
  const debtorIsCurrent = (debtorItem?.user.id ?? -1) === currentUserId;
  const creditorIsCurrent = (creditorItem?.user.id ?? -1) === currentUserId;

  return (
    <Typography
      color={COLORS.PRIMARY}
      sx={{
        typography: { xs: "body2", md: "body1" },
        fontWeight: { xs: 600, md: 700 },
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
  );
};

const TransactionRow = ({
  transaction,
  onOpenDetail,
}: {
  transaction: TTransaction;
  onOpenDetail?: (t: TTransaction) => void;
}) => {
  const userId = useAuthStore((s) => s.currentUser.id);
  const userSplit = transaction.items
    .filter((item) => item.user.id === userId)
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
        <Box
          sx={{
            color: COLORS.PRIMARY,
            display: "flex",
            justifyContent: "center",
            width: { xs: 30, md: 40 },
            heigh: { xs: 30, md: 40 },
          }}
        >
          {getCategoryIcon(transaction)}
        </Box>

        {transaction.transactionType === "PAYMENT" ? (
          <Box flex={1} sx={{ px: { md: 5 } }}>
            <PaymentMessage transaction={transaction} />
          </Box>
        ) : (
          <>
            <Stack direction="row" flex={1} sx={{ px: { md: 5 } }} gap={1}>
              <Stack width="55%" gap={1}>
                <Typography
                  fontWeight="bold"
                  color={COLORS.PRIMARY}
                  sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}
                >
                  {transaction.title}
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={isNegative ? COLORS.RED : COLORS.PRIMARY}
                  sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}
                >
                  <FormattedMessage id="groupDetail.expenses.yourSplit" />: {userSplit.toFixed(2)}{" "}
                  {currencySymbol}
                </Typography>
              </Stack>

              <Stack width="45%" gap={1}>
                <Typography color={COLORS.PRIMARY} sx={{ fontSize: { xs: "0.75rem", md: "1rem" } }}>
                  <FormattedMessage id="groupDetail.expenses.totalPaid" />:{" "}
                  {transaction.totalAmount.toFixed(2)} {currencySymbol}
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

const MonthSection = ({
  month,
  transactions,
  onOpenDetail,
}: {
  month: string;
  transactions: TTransaction[];
  onOpenDetail?: (t: TTransaction) => void;
}) => {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const intl = useIntl();

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const categorySet = new Set(selectedCategories);

    return transactions.filter((t) => {
      const matchesSearch = !q || (t.title ?? "").toLowerCase().includes(q);
      const matchesCategory =
        categorySet.size === 0 || (t.expenseCategory && categorySet.has(t.expenseCategory));
      return matchesSearch && matchesCategory;
    });
  }, [transactions, searchQuery, selectedCategories]);

  const groupTransactionsByMonth = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        const month = new Intl.DateTimeFormat(intl.locale, {
          month: "long",
          year: "numeric",
        }).format(new Date(transaction.createdAt));

        if (!acc[month]) acc[month] = [];
        acc[month].push(transaction);
        return acc;
      },
      {} as Record<string, TTransaction[]>
    );
  }, [filteredTransactions, intl.locale]);

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  return (
    <Box>
      <Stack mb={2} direction="row" gap={2} alignItems="center" sx={{ mt: { xs: 1, md: 0 } }}>
        <TextField
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label={<FormattedMessage id="groupDetail.expenses.search.label" />}
          placeholder={intl.formatMessage({ id: "groupDetail.expenses.search.placeholder" })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            },
          }}
        />

        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: selectedCategories.length ? COLORS.PRIMARY : "inherit" }}
        >
          <Badge badgeContent={selectedCategories.length} color="primary">
            <FilterAltIcon />
          </Badge>
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {categories.map((category) => (
            <MenuItem key={category.name} onClick={() => toggleCategory(category.name)}>
              <Checkbox
                size="small"
                checked={selectedCategories.includes(category.name)}
                sx={{ mr: 1 }}
              />
              <ListItemText primary={<FormattedMessage id={category.intlId} />} />
            </MenuItem>
          ))}
          {selectedCategories.length > 0 && (
            <MenuItem
              onClick={() => setSelectedCategories([])}
              sx={{
                justifyContent: "center",
                color: "error.main",
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" fontWeight="bold" color={COLORS.RED}>
                <FormattedMessage id="groupDetail.expenses.clearFilter" />
              </Typography>
            </MenuItem>
          )}
        </Menu>
      </Stack>

      {Object.entries(groupTransactionsByMonth).map(([month, txs]) => (
        <MonthSection
          key={month}
          month={month}
          transactions={txs}
          onOpenDetail={(t) => {
            setSelectedTransaction(t);
            setDetailOpen(true);
          }}
        />
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
