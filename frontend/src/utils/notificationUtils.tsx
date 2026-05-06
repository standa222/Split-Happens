import {ReactNode} from "react";
import {TNotification, TNotificationType} from "../types/dto/TNotification";
import {FormattedMessage} from "react-intl";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import logo from "../assets/logo_dark.png";
import { Box } from "@mui/material";

export function extractNotificationMessage(notification: TNotification): ReactNode {
  const intlId = mapNotificationTypeToIntlId(notification.notificationType);
  const parameters = notification.messageParameters || {};

  return (
    <FormattedMessage
      id={intlId}
      values={parameters}
    />
  );
}

const NOTIFICATION_ID_MAP: Record<TNotificationType, string> = {
  EXPENSE_ADDED: "notifications.expenseAdded",
  DEBT_SETTLED: "notifications.debtSettled",
  ADDED_TO_GROUP: "notifications.addedToGroup",
  RECEIVED_FRIEND_REQUEST: "notifications.receivedFriendRequest",
  ACCEPTED_FRIEND_REQUEST: "notifications.acceptedFriendRequest",
  REJECTED_FRIEND_REQUEST: "notifications.rejectedFriendRequest",
};

function mapNotificationTypeToIntlId(type: TNotificationType): string {
  return NOTIFICATION_ID_MAP[type] ?? "notifications.unknown";
}


const NOTIFICATION_LINK_MAP: Record<TNotificationType, (id?: number) => string> = {
  EXPENSE_ADDED: (id) => `/groups/${id}`,
  DEBT_SETTLED: (id) => `/debts/${id}`,
  ADDED_TO_GROUP: (id) => `/groups/${id}`,
  RECEIVED_FRIEND_REQUEST: () => `/friends`,
  ACCEPTED_FRIEND_REQUEST: (id) => `/friends/${id}`,
  REJECTED_FRIEND_REQUEST: () => `/friends`,
};

export function extractNotificationLink(notification: TNotification): string {
  const linkFn = NOTIFICATION_LINK_MAP[notification.notificationType];
  return linkFn ? linkFn(notification.targetId) : "/";
}

const NOTIFICATION_ICON_MAP: Record<TNotificationType, ReactNode> = {
  EXPENSE_ADDED: <NotificationsIcon sx={{ fontSize: { xs: 20, md: 30 } }} />,
  DEBT_SETTLED: getLogo(),
  ADDED_TO_GROUP: <GroupIcon sx={{ fontSize: { xs: 20, md: 30 } }} />,
  RECEIVED_FRIEND_REQUEST: <PersonAddIcon sx={{ fontSize: { xs: 20, md: 30 } }} />,
  ACCEPTED_FRIEND_REQUEST: <HandshakeIcon sx={{ fontSize: { xs: 20, md: 30 } }} />,
  REJECTED_FRIEND_REQUEST: <PersonRemoveIcon sx={{ fontSize: { xs: 20, md: 30 } }} />,
};

export function extractNotificationIcon(notification: TNotification): ReactNode {
  return NOTIFICATION_ICON_MAP[notification.notificationType] || "🔔";
}

function getLogo() {
  return (
    <Box sx={{ height: { xs: 20, md: 30 }, width: { xs: 20, md: 30 } }}>
      <img src={logo} alt="Logo" style={{ height: "100%", width: "100%" }} />
    </Box>
  );
}