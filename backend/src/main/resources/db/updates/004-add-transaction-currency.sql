--liquibase formatted sql
--changeset stanislav:4

ALTER TABLE "transaction"
ADD COLUMN currency VARCHAR(3) NOT NULL;

ALTER TABLE transaction_item
ADD COLUMN default_currency_balance_change DECIMAL(19, 4) NOT NULL;