--liquibase formatted sql
--changeset stanislav:7

DROP TABLE IF EXISTS expense_category CASCADE;

ALTER TABLE "transaction" DROP COLUMN IF EXISTS category_id;

ALTER TABLE "transaction" ADD COLUMN IF NOT EXISTS expense_category VARCHAR(30);

ALTER TABLE "transaction" DROP CONSTRAINT IF EXISTS chk_expense_category;

ALTER TABLE "transaction" ADD CONSTRAINT chk_expense_category CHECK (transaction_type <> 'EXPENSE' OR expense_category IS NOT NULL);
