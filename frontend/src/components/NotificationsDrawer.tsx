import {CircularProgress, Drawer, Typography} from "@mui/material"
import {useNotificationsQuery} from "../hooks/useNotifications";
import {FormattedMessage} from "react-intl";
import {TNotification} from "../types/dto/TNotification";
import {extractNotificationMessage} from "../utils/notificationMessageUtils";

type Props = {
  open: boolean;
  onClose: () => void;
}

type NotificationsContentProps = {
  notifications: TNotification[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

const NotificationItem = ({ notification }: { notification: TNotification }) => {
  const message = extractNotificationMessage(notification);

  return (
    <Typography sx={{ py: 1 }}>
      {message}
    </Typography>
  )
}

const NotificationsContent = ({ notifications, isLoading, isError }: NotificationsContentProps) => {
  console.log("content", notifications);
  if (isLoading) {
    return (
      <>
        <Typography>
          <FormattedMessage id="notifications.loading" />
        </Typography>
        <CircularProgress color="inherit" size={20} />
      </>
    )
  }
  console.log("not loading", notifications);

  if (isError) {
    return (
      <Typography color="error">
        <FormattedMessage id="notifications.error" />
      </Typography>
    )
  }

  console.log("not error", notifications);

  if (!notifications || notifications.length === 0) {
    return (
      <Typography>
        <FormattedMessage id="notifications.empty" />
      </Typography>
    )
  }

  console.log("not empty", notifications);

  return (
    <>
      {(notifications).map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </>
  )
}

export const NotificationsDrawer = ({ open, onClose }: Props) => {
  const { data: notifications, isLoading, isError } = useNotificationsQuery();
  console.log("drawer", notifications);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Typography>
        <FormattedMessage id ="notifications.title" />
      </Typography>
      <NotificationsContent notifications={notifications} isLoading={isLoading} isError={isError} />
    </Drawer>
  )
}