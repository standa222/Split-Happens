--liquibase formatted sql
--changeset stanislav:11

ALTER TABLE transaction_item
DROP CONSTRAINT IF EXISTS transaction_item_user_id_fkey;

ALTER TABLE transaction_item
ADD CONSTRAINT transaction_item_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES "user"(id)
ON DELETE SET NULL;