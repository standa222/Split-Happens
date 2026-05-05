import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useLeaveGroup } from "../hooks/useGroupMutation";
import { COLORS } from "../constants/colors";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../enums/routes";

type Props = {
  open: boolean;
  onClose: () => void;
  groupId: number;
  groupName?: string;
};

export const LeaveGroupModal = ({ open, onClose, groupId, groupName }: Props) => {
  const navigate = useNavigate();

  const leaveGroup = useLeaveGroup({
    onSuccess: () => {
      onClose();
      navigate(ROUTES.GROUPS.LIST);
    },
  });

  const handleLeave = () => {
    if (leaveGroup.isPending) return;
    leaveGroup.mutate(groupId);
  };

  return (
    <Dialog
      open={open}
      onClose={leaveGroup.isPending ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: { xs: 0, md: 6 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
        <FormattedMessage id="group.leave.title" values={{ name: groupName ?? "" }} />
      </DialogTitle>

      <DialogContent>
        <Typography>
          <FormattedMessage id="group.leave.confirm" values={{ name: groupName ?? "" }} />
        </Typography>

        {leaveGroup.isError && (
          <Typography sx={{ mt: 2, color: COLORS.RED }}>
            <FormattedMessage id="group.leave.error" />
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={leaveGroup.isPending}
          color="inherit"
          sx={{ borderRadius: 40 }}
        >
          <FormattedMessage id="common.cancel" />
        </Button>

        <Button
          onClick={handleLeave}
          variant="contained"
          sx={{ bgcolor: COLORS.RED, borderRadius: 40, "&:hover": { bgcolor: COLORS.RED } }}
          disabled={leaveGroup.isPending}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            {leaveGroup.isPending && <CircularProgress size={18} sx={{ color: "white" }} />}
            <span>
              <FormattedMessage
                id={leaveGroup.isPending ? "group.leave.leaving" : "group.leave.action"}
              />
            </span>
          </Stack>
        </Button>
      </DialogActions>
    </Dialog>
  );
};
