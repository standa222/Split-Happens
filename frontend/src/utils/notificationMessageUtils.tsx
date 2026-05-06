import {ReactNode} from "react";
import {TNotification, TNotificationType} from "../types/dto/TNotification";
import {FormattedMessage} from "react-intl";

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