--liquibase formatted sql
--changeset stanislav:12

ALTER TABLE notification DROP COLUMN message;
ALTER TABLE notification ADD COLUMN message_params JSONB;