import {
  Box,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckIcon from '@mui/icons-material/Check';
import { useNotificationsQuery } from "../hooks/useNotifications";
import { FormattedMessage } from "react-intl";
import { TNotification } from "../types/dto/TNotification";
import {extractNotificationIcon, extractNotificationLink, extractNotificationMessage} from "../utils/notificationUtils";
import {
  useMarkAllAsReadMutation,
  useMarkNotificationAsReadMutation
} from "../hooks/useNotifications"; // Adjust path accordingly
import { COLORS } from "../constants/colors";
import {useNavigate} from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";

type Props = {
  open: boolean;
  onClose: () => void;
}

type NotificationsContentProps = {
  notifications: TNotification[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
}

type NotificationItemProps = {
  notification: TNotification;
  isNotification: boolean;
  onClose?: () => void;
}

export const NotificationItem = ({ notification, onClose, isNotification }: NotificationItemProps) => {
  const message = extractNotificationMessage(notification);
  const link = extractNotificationLink(notification);
  const { mutate: markAsRead } = useMarkNotificationAsReadMutation();
  const navigate = useNavigate();

  const handleItemClick = () => {
    navigate(link);
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onClose();
  }

  return (
    <>
      <ListItem
        onClick={handleItemClick}
        sx={{
          color: COLORS.PRIMARY,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 2,
          cursor: 'pointer',
          gap: 2,
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
        }}
      >
        {extractNotificationIcon(notification)}
        <Typography variant="body1" sx={{ flex: 1, pr: 1, fontWeight: (notification.read || !isNotification) ? 400 : 600 }}>
          {message}
        </Typography>

        {isNotification && !notification.read && (
          <Tooltip title={<FormattedMessage id="notifications.markAsRead" />}>
            <IconButton
              size="small"
              onClick={() => markAsRead(notification.id)}
              sx={{ color: COLORS.PRIMARY, mt: -0.5 }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </ListItem>
      <Divider />
    </>
  )
}

const NotificationsContent = ({ notifications, isLoading, isError, onClose }: NotificationsContentProps) => {
  if (isLoading) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ mt: 4 }}>
        <CircularProgress size={30} sx={{ color: COLORS.PRIMARY }} />
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id="notifications.loading" />
        </Typography>
      </Stack>
    )
  }

  if (isError || !notifications || notifications.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage id={isError ? "notifications.error" : "notifications.empty"} />
        </Typography>
      </Box>
    )
  }

  return (
    <List sx={{ p: 0 }}>
      {notifications.map((notification: TNotification) => (
        <NotificationItem key={notification.id} notification={notification} onClose={onClose} isNotification={true}/>
      ))}
    </List>
  )
}

export const NotificationsDrawer = ({ open, onClose }: Props) => {
  const { data: notifications, isLoading, isError } = useNotificationsQuery();
  const { mutate: markAllRead } = useMarkAllAsReadMutation();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 500 },
            backgroundColor: COLORS.SECONDARY,
            borderLeft: `5px solid ${COLORS.PRIMARY}`
          }
        }
      }}
    >
      <Box sx={{ py: 1, px: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ color: COLORS.PRIMARY, fontWeight: 700, flex: 1 }}>
          <FormattedMessage id="notifications.title" />
        </Typography>

        <Tooltip title={<FormattedMessage id="notifications.markAllAsRead" />}>
          <IconButton
            onClick={() => {
              markAllRead();
              onClose();
            }}
            disabled={!notifications || notifications.length === 0}
            sx={{ color: COLORS.PRIMARY }}
          >
            <DoneAllIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderBottomWidth: 2, borderColor: COLORS.PRIMARY }} />

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <NotificationsContent
          notifications={notifications}
          isLoading={isLoading}
          isError={isError}
          onClose={onClose}
        />
      </Box>
    </Drawer>
  )
}