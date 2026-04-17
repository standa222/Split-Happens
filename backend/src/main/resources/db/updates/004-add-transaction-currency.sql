--liquibase formatted sql
--changeset stanislav:4

ALTER TABLE "transaction"
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL;

ALTER TABLE transaction_item
ADD COLUMN IF NOT EXISTS default_currency_balance_change DECIMAL(19, 4) NOT NULL;