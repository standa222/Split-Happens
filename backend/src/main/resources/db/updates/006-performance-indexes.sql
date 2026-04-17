--liquibase formatted sql
--changeset stanislav:6

CREATE INDEX IF NOT EXISTS idx_group_member_user_id ON group_member(user_id);

CREATE INDEX IF NOT EXISTS idx_transaction_group_id ON "transaction"(group_id);
CREATE INDEX IF NOT EXISTS idx_transaction_group_created_at_desc ON "transaction"(group_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_item_transaction_id ON transaction_item(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_item_user_id ON transaction_item(user_id);

CREATE INDEX IF NOT EXISTS idx_debt_group_id ON debt(group_id);

CREATE INDEX IF NOT EXISTS idx_debt_debtor_id ON debt(debtor_id);
CREATE INDEX IF NOT EXISTS idx_debt_creditor_id ON debt(creditor_id);

CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification(user_id);

CREATE INDEX IF NOT EXISTS idx_friend_friend_id ON friend(friend_id);

