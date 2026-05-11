import { Box, Button, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import CloseIcon from "@mui/icons-material/Close";
import { COLORS } from "../constants/colors";

type Props = {
  open: boolean;
  onClose: () => void;
  onRemove: () => void;
  isRemovePending: boolean;
  friendName?: string;
};

export function RemoveFriendModal({ open, onClose, onRemove, isRemovePending, friendName }: Props) {
  const handleClose = () => {
    if (isRemovePending) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <IconButton
        aria-label="close"
        onClick={handleClose}
        disabled={isRemovePending}
        sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
      >
        <CloseIcon sx={{ fontSize: 40 }} />
      </IconButton>

      <DialogContent>
        <Stack spacing={2} sx={{ color: COLORS.PRIMARY }}>
          <Typography variant="h6">
            <FormattedMessage id="friends.remove.modal.title" />
          </Typography>

          <Typography variant="body1">
            <FormattedMessage id="friends.remove.modal.confirmation" />
          </Typography>

          {friendName ? (
            <Typography variant="body1" fontWeight={700} noWrap>
              {friendName}
            </Typography>
          ) : null}
        </Stack>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={onRemove}
            variant="contained"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: COLORS.RED,
              color: COLORS.SECONDARY,
              "&:hover": {
                backgroundColor: COLORS.RED,
                opacity: 0.92,
              },
            }}
            disabled={isRemovePending}
          >
            {isRemovePending ? (
              <FormattedMessage id="friends.remove.modal.removing" />
            ) : (
              <FormattedMessage id="friends.remove.modal.action" />
            )}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
