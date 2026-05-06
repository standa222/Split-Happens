import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useEffect, useMemo, useState } from "react";
import { TDebt } from "../types/TDebt";
import { COLORS } from "../constants/colors";
import { addBackgroundToQr, getQr } from "../utils/qrUtils";
import CloseIcon from "@mui/icons-material/Close";
import { formatMoneyWithSymbol } from "../utils/currencyUtils";

function downloadBlobUrl(objectUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

type Props = {
  open: boolean;
  onClose: () => void;
  debt: TDebt;
  /** Group default currency (QR payments are currently supported only for CZK). */
  groupCurrency?: string;
  onSettle: () => void;
  isSettlePending: boolean;
};

function formatBankAccount(bankAccount: {
  prefix: string;
  accountNumber: string;
  bankCode: string;
}) {
  const prefix = bankAccount.prefix?.trim();
  const accountNumber = bankAccount.accountNumber?.trim();
  const bankCode = bankAccount.bankCode?.trim();

  const left = prefix ? `${prefix}-${accountNumber}` : accountNumber;
  return `${left}/${bankCode}`;
}

export const QRPaymentDialog = ({
  open,
  onClose,
  debt,
  groupCurrency,
  onSettle,
  isSettlePending,
}: Props) => {
  const intl = useIntl();

  const creditorName = `${debt.creditor.firstName} ${debt.creditor.lastName}`.trim();
  const debtorName = `${debt.debtor.firstName} ${debt.debtor.lastName}`.trim();

  const bankAccount = debt.creditor.bankAccount;

  const amount = useMemo(() => Number(debt.amount), [debt.amount]);

  const normalizedCurrency = (groupCurrency ?? "").trim().toUpperCase();
  const isCzk = !normalizedCurrency || normalizedCurrency === "CZK";

  const [qrObjectUrl, setQrObjectUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [qrBlob, setQrBlob] = useState<Blob | null>(null);

  const onDownloadQr = async () => {
    if (!qrObjectUrl) return;
    try {
      const downloadBlob = await addBackgroundToQr(qrBlob);
      const downloadUrl = URL.createObjectURL(downloadBlob);

      const safeName = (creditorName || "qr").replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = `qr_${safeName}_${amount.toFixed(2)}_${normalizedCurrency || "CZK"}.png`;

      downloadBlobUrl(downloadUrl, filename);
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error("Failed to generate download image", e);
    }
  };

  // Fetch QR image when dialog opens (and creditor has a bank account)
  useEffect(() => {
    if (!open) return;

    // Reset for each open
    setQrError(null);

    if (!bankAccount) {
      // No bank account => we only show info message, no fetch.
      setIsQrLoading(false);
      setQrObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    if (!isCzk) {
      // Only CZK supported currently.
      setIsQrLoading(false);
      setQrObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsQrLoading(true);

        const result = await getQr({
          accountPrefix: bankAccount.prefix ?? "",
          accountNumber: bankAccount.accountNumber,
          bankCode: bankAccount.bankCode,
          amount,
        });

        if (cancelled) {
          URL.revokeObjectURL(result.objectUrl);
          return;
        }

        setQrObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return result.objectUrl;
        });
        setQrBlob(result.blob);
      } catch (e) {
        if (cancelled) return;
        setQrError(e instanceof Error ? e.message : String(e));
        setQrObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        if (!cancelled) setIsQrLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, bankAccount, amount, isCzk]);

  // Cleanup blob URL when dialog closes/unmounts
  useEffect(() => {
    if (open) return;
    setQrObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setIsQrLoading(false);
    setQrError(null);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
      >
        <CloseIcon sx={{ fontSize: 40 }} />
      </IconButton>
      <DialogContent>
        <Stack spacing={2} sx={{ color: COLORS.PRIMARY }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            <FormattedMessage id="qrPayment.title" />
          </Typography>
          <Typography>
            <FormattedMessage
              id="qrPayment.subtitle"
              defaultMessage="Pay {amount} to {creditorName}"
              values={{
                amount: formatMoneyWithSymbol(debt.amount, normalizedCurrency),
                creditorName: creditorName || "—",
              }}
            />
          </Typography>

          <Divider />

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography fontWeight={700}>
                <FormattedMessage id="qrPayment.from" defaultMessage="From" />
              </Typography>
              <Typography>{debtorName || "—"}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography fontWeight={700}>
                <FormattedMessage id="qrPayment.to" defaultMessage="To" />
              </Typography>
              <Typography>{creditorName || "—"}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography fontWeight={700}>
                <FormattedMessage id="qrPayment.amount" defaultMessage="Amount" />
              </Typography>
              <Typography>{formatMoneyWithSymbol(debt.amount, normalizedCurrency)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" gap={2}>
              <Typography fontWeight={700}>
                <FormattedMessage id="qrPayment.bankAccount" defaultMessage="Bank account" />
              </Typography>
              <Typography>{bankAccount ? formatBankAccount(bankAccount) : "—"}</Typography>
            </Stack>
          </Stack>

          {!bankAccount ? (
            <Alert severity="info">
              <FormattedMessage
                id="qrPayment.noBankAccount"
                defaultMessage="The creditor doesn’t have a bank account set, so a QR payment can’t be generated."
              />
            </Alert>
          ) : !isCzk ? (
            <Alert severity="warning">
              <FormattedMessage
                id="qrPayment.currencyNotSupported"
                defaultMessage="QR payment is currently implemented only for CZK. (Current currency: {currency})"
                values={{ currency: normalizedCurrency || "—" }}
              />
            </Alert>
          ) : qrError ? (
            <Alert severity="error">
              <Stack spacing={1}>
                <Typography fontWeight={700}>
                  <FormattedMessage
                    id="qrPayment.error"
                    defaultMessage="Failed to load QR image."
                  />
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                  {qrError}
                </Typography>
              </Stack>
            </Alert>
          ) : (
            <Box
              sx={{
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              {isQrLoading ? (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress />
                  <Typography sx={{ opacity: 0.8 }}>
                    <FormattedMessage id="qrPayment.loading" defaultMessage="Loading QR..." />
                  </Typography>
                </Stack>
              ) : qrObjectUrl ? (
                <Box
                  component="img"
                  src={qrObjectUrl}
                  alt={intl.formatMessage({ id: "qrPayment.qrAlt", defaultMessage: "QR payment" })}
                  sx={{
                    width: "100%",
                    maxWidth: 320,
                    height: "auto",
                  }}
                />
              ) : (
                <Typography sx={{ opacity: 0.8 }}>
                  <FormattedMessage
                    id="qrPayment.qrPlaceholder.text"
                    defaultMessage="QR generation will be implemented later."
                  />
                </Typography>
              )}
            </Box>
          )}
        </Stack>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }} gap={2}>
          <Button
            onClick={onDownloadQr}
            variant="outlined"
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              borderColor: COLORS.PRIMARY,
              color: COLORS.PRIMARY,
            }}
          >
            <FormattedMessage id="qrPayment.download" />
          </Button>
          <Button
            onClick={onSettle}
            variant="contained"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.SECONDARY,
            }}
            disabled={isSettlePending}
          >
            {isSettlePending ? (
              <FormattedMessage id="settleModal.settling" />
            ) : (
              <FormattedMessage id="settleModal.action" />
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
