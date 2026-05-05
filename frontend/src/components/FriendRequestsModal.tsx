import { Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FormattedMessage, useIntl } from "react-intl";
import { COLORS } from "../constants/colors";
import { FriendRequestsPanel } from "./FriendRequestsPanel";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
};

export function FriendRequestsModal({ open, onClose, onSuccessMessage, onErrorMessage }: Props) {
  const intl = useIntl();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 10,
        },
      }}
    >
      <IconButton
        aria-label={intl.formatMessage({ id: "common.close", defaultMessage: "Close" })}
        onClick={onClose}
        sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
      >
        <CloseIcon sx={{ fontSize: 40 }} />
      </IconButton>

      <DialogContent>
        <Stack spacing={2} sx={{ color: COLORS.PRIMARY }}>
          <Typography variant="h6" fontWeight={700}>
            <FormattedMessage id="friends.requests.manageTitle" defaultMessage="Friend requests" />
          </Typography>

          <FriendRequestsPanel
            onSuccessMessage={onSuccessMessage}
            onErrorMessage={onErrorMessage}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
