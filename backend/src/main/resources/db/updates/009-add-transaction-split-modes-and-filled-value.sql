--liquibase formatted sql
--changeset stanislav:9

ALTER TABLE "transaction"
ADD COLUMN IF NOT EXISTS paid_by_mode VARCHAR(20) NOT NULL DEFAULT 'FIXED';

ALTER TABLE "transaction"
ADD COLUMN IF NOT EXISTS split_between_mode VARCHAR(20) NOT NULL DEFAULT 'FIXED';

ALTER TABLE transaction_item
ADD COLUMN IF NOT EXISTS filled_value DECIMAL(19, 4);

-- Backfill existing rows (legacy transactions) so we can enforce NOT NULL.
UPDATE transaction_item
SET filled_value = balance_change
WHERE filled_value IS NULL;

ALTER TABLE transaction_item
ALTER COLUMN filled_value SET NOT NULL;

