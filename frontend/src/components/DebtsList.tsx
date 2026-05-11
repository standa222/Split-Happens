import { Stack, Typography, Button, StackProps } from "@mui/material";
import { TDebt } from "../types/TDebt";
import { useAuthStore } from "../store/authStore";
import { TUser } from "../types/TUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { COLORS } from "../constants/colors";
import { FormattedMessage, useIntl } from "react-intl";
import { useSettleDebt } from "../hooks/useSettleDebt";
import { QRPaymentDialog } from "./QRPaymentDialog";
import { useState } from "react";
import { getCurrencySymbol } from "../utils/currencyUtils";
import { SettleModal } from "./SettleModal";
import { AppSnackbar } from "./AppSnackbar";
import { useNotifyDebt } from "../hooks/useNotifyDebt";

type Props = {
  userDebts: TDebt[];
  user: TUser;
  showActionButtons?: boolean;
  groupId: number;
  /** Group default currency (QR payments are currently supported only for CZK). */
  groupCurrency?: string;
  display?: StackProps["display"];
  showDividers?: boolean;
};

type DebtActionButtonsProps = {
  debt: TDebt;
  groupId: number;
  groupCurrency?: string;
  owesLine?: string;
  onSnackbarSuccess?: (message: string) => void;
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

const DebtActionButtons = ({
  debt,
  groupId,
  groupCurrency,
  owesLine,
  onSnackbarSuccess,
}: DebtActionButtonsProps) => {
  const intl = useIntl();
  const { mutate: settleDebt, isPending: isSettleDebtPending } = useSettleDebt();
  const { mutate: notify, isPending: isNotifyPending } = useNotifyDebt();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);

  const onMarkPaid = () => {
    setSettleModalOpen(true);
  };

  const onNotify = () => {
    notify(
      { debtId: debt.id },
      {
        onSuccess: () => {
          onSnackbarSuccess?.(intl.formatMessage({ id: "debt.notify.success" }));
        },
      }
    );
  };

  const handleSettleFromQr = () => {
    settleDebt(
      { debtId: debt.id, groupId },
      {
        onSuccess: () => {
          setQrModalOpen(false);
          onSnackbarSuccess(intl.formatMessage({ id: "debt.settle.success" }));
        },
      }
    );
  };

  const handleSettleFromModal = () => {
    settleDebt(
      { debtId: debt.id, groupId },
      {
        onSuccess: () => {
          setSettleModalOpen(false);
          onSnackbarSuccess(intl.formatMessage({ id: "debt.settle.success" }));
        },
      }
    );
  };

  return (
    <>
      <Stack
        direction="row"
        gap={2}
        alignItems="center"
        width={{ xs: "100%", md: "auto" }}
        justifyContent="space-around"
      >
        <Button
          variant="text"
          size="small"
          onClick={onMarkPaid}
          disabled={isSettleDebtPending}
          sx={{
            minWidth: 0,
            p: 0,
            display: "flex",
            flexDirection: "column",
            textTransform: "none",
            color: COLORS.PRIMARY,
          }}
        >
          <CheckBoxIcon sx={{ fontSize: { xs: 32, md: 20 } }} />
          <Typography variant="caption">
            <FormattedMessage id="debts.actions.markPaid" />
          </Typography>
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={() => setQrModalOpen(true)}
          sx={{
            minWidth: 0,
            p: 0,
            display: "flex",
            flexDirection: "column",
            textTransform: "none",
            color: COLORS.PRIMARY,
          }}
        >
          <QrCode2Icon sx={{ fontSize: { xs: 32, md: 20 } }} />
          <Typography variant="caption">
            <FormattedMessage id="debts.actions.generateQr" />
          </Typography>
        </Button>

        <Button
          variant="text"
          size="small"
          onClick={onNotify}
          disabled={isNotifyPending}
          sx={{
            minWidth: 0,
            p: 0,
            display: "flex",
            flexDirection: "column",
            textTransform: "none",
            color: COLORS.PRIMARY,
          }}
        >
          <NotificationsIcon sx={{ fontSize: { xs: 32, md: 20 } }} />
          <Typography variant="caption">
            <FormattedMessage id="debts.actions.notify" />
          </Typography>
        </Button>
      </Stack>
      <QRPaymentDialog
        open={qrModalOpen}
        onClose={() => {
          if (isSettleDebtPending) return;
          setQrModalOpen(false);
        }}
        debt={debt}
        groupCurrency={groupCurrency}
        onSettle={handleSettleFromQr}
        isSettlePending={isSettleDebtPending}
      />
      <SettleModal
        open={settleModalOpen}
        onClose={() => {
          if (isSettleDebtPending) return;
          setSettleModalOpen(false);
        }}
        onSettle={handleSettleFromModal}
        currency={groupCurrency}
        isSettlePending={isSettleDebtPending}
        owesLine={owesLine}
      />
    </>
  );
};

export const DebtsList = ({
  userDebts,
  user,
  showActionButtons = false,
  groupId,
  groupCurrency,
  display,
}: Props) => {
  const intl = useIntl();
  const currentUserId = useAuthStore((s) => s.currentUser.id);
  const currencySymbol = getCurrencySymbol(groupCurrency);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const isSettled = userDebts.length === 0;
  const isCurrentUser = user.id === currentUserId;
  const userName = `${user.firstName ?? ""}`.trim();

  return (
    <>
      {isSettled ? (
        <Typography variant="body1" sx={{ display }}>
          <FormattedMessage id="debts.settled" values={{ isCurrentUser, name: userName }} />
        </Typography>
      ) : (
        <Stack gap={1} sx={{ display }}>
          {userDebts.map((debt) => {
            const debtorIsCurrent = debt.debtor.id === currentUserId;
            const creditorIsCurrent = debt.creditor.id === currentUserId;

            const debtorName = (debt.debtor.firstName ?? debt.debtor.email ?? "").trim();
            const creditorName = (debt.creditor.firstName ?? debt.creditor.email ?? "").trim();

            const translatedMessage = intl.formatMessage(
              { id: "debts.owesLine" },
              {
                debtorIsCurrent,
                creditorIsCurrent,
                debtorName,
                creditorName,
                amount: debt.amount.toFixed(2),
                currencySymbol,
              }
            );

            return (
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "start", md: "center" }}
                justifyContent="space-between"
                key={debt.id}
                gap={2}
              >
                <Typography variant="body1" color={COLORS.PRIMARY}>
                  {translatedMessage}
                </Typography>
                {showActionButtons && (
                  <DebtActionButtons
                    debt={debt}
                    groupId={groupId}
                    groupCurrency={groupCurrency}
                    owesLine={translatedMessage}
                    onSnackbarSuccess={(message) =>
                      setSnackbar({ open: true, severity: "success", message })
                    }
                  />
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      <AppSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </>
  );
};
