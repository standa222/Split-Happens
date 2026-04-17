--liquibase formatted sql
--changeset stanislav:5

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS profile_image BYTEA;

ALTER TABLE "group"
ADD COLUMN IF NOT EXISTS group_image BYTEA;