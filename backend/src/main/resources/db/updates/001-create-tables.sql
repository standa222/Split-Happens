--liquibase formatted sql
--changeset stanislav:1

-- 1. User
CREATE TABLE IF NOT EXISTS "user" (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. Bank Account
CREATE TABLE IF NOT EXISTS bank_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    prefix VARCHAR(10),
    account_number VARCHAR(20) NOT NULL,
    bank_code VARCHAR(10) NOT NULL
);

-- 3. Group Table
CREATE TABLE IF NOT EXISTS "group" (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    default_currency VARCHAR(3) DEFAULT 'CZK',
    permission_mode VARCHAR(20) DEFAULT 'SOFT', -- SOFT, STRICT
    group_type VARCHAR(20) DEFAULT 'GROUP'     -- GROUP, FRIEND
);

-- 4. Group Member Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS group_member (
    group_id BIGINT REFERENCES "group"(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    PRIMARY KEY (group_id, user_id)
);

-- 5. Friend Mapping (Self-referencing Many-to-Many)
CREATE TABLE IF NOT EXISTS friend (
    user_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    friend_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    group_id BIGINT REFERENCES "group"(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, friend_id),
    CONSTRAINT friend_not_self CHECK (user_id <> friend_id)
);

-- 6. Expense Category
CREATE TABLE IF NOT EXISTS expense_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- 7. Transaction
CREATE TABLE IF NOT EXISTS "transaction" (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "group"(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES expense_category(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    total_amount DECIMAL(19, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(20) NOT NULL -- EXPENSE, PAYMENT
);

-- 8. Transaction Item
CREATE TABLE IF NOT EXISTS transaction_item (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT REFERENCES "transaction"(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    balance_change DECIMAL(19, 4) NOT NULL
);

-- 9. Debt (Simplified State)
CREATE TABLE IF NOT EXISTS debt (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES "group"(id) ON DELETE CASCADE,
    debtor_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    creditor_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    amount DECIMAL(19, 4) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 10. Notification
CREATE TABLE IF NOT EXISTS notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    target_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);