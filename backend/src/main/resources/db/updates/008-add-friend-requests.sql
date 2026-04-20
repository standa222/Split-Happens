--liquibase formatted sql
--changeset stanislav:8

CREATE TABLE IF NOT EXISTS friend_request (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT friend_request_not_self CHECK (sender_id <> receiver_id)
);

-- Fast lookup: inbox/outbox
CREATE INDEX IF NOT EXISTS idx_friend_request_receiver_id ON friend_request(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_request_sender_id ON friend_request(sender_id);

-- Ensure only one request of a given status per direction.
-- (H2 used in tests doesn't support partial indexes with WHERE.)
CREATE UNIQUE INDEX IF NOT EXISTS uq_friend_request_sender_receiver_status
    ON friend_request(sender_id, receiver_id, status);


