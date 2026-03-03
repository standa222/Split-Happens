--liquibase formatted sql
--changeset stanislav:3

-- Adding the column with a default value handles existing rows
ALTER TABLE "group"
ADD COLUMN last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;