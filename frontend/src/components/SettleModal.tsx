import { Box, Button, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { COLORS } from "../constants/colors";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  onClose: () => void;
  currency: string;
  onSettle: () => void;
  isSettlePending: boolean;
  owesLine: string;
};

export const SettleModal = ({ open, onClose, onSettle, isSettlePending, owesLine }: Props) => {
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
          <Typography variant="h6">
            <FormattedMessage id="settleModal.title" />
          </Typography>

          <Typography variant="body1">
            <FormattedMessage id="settleModal.confirmation" />
          </Typography>

          <Typography variant="body1" fontWeight={700}>
            {owesLine}
          </Typography>
        </Stack>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
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
