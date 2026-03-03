--liquibase formatted sql
--changeset stanislav:2

CREATE TABLE IF NOT EXISTS debt (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES "group"(id) ON DELETE CASCADE,
    amount DECIMAL(19, 4) NOT NULL,
    debtor_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    creditor_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);