--liquibase formatted sql
--changeset stanislav:10

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
