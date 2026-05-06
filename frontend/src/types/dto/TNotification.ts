export type TNotificationType =
    "EXPENSE_ADDED" |
    "DEBT_SETTLED" |
    "ADDED_TO_GROUP" |
    "RECEIVED_FRIEND_REQUEST" |
    "ACCEPTED_FRIEND_REQUEST" |
    "REJECTED_FRIEND_REQUEST";

export type TNotification = {
    id: number;
    read: boolean;
    targetId?: number;
    notificationType: TNotificationType;
    messageParameters: Record<string, string>;
}