-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email addresses must be unique, ignoring letter case
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
ON users (LOWER(email));

-- Glucose readings table
CREATE TABLE IF NOT EXISTS glucose_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    reading_date DATE NOT NULL,

    reading_slot VARCHAR(30) NOT NULL
        CHECK (
            reading_slot IN (
                'Morning fasting',
                'After breakfast',
                'After lunch',
                'After dinner'
            )
        ),

    glucose_level INTEGER NOT NULL
        CHECK (glucose_level BETWEEN 40 AND 600),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_reading_slot
        UNIQUE (user_id, reading_date, reading_slot)
);

-- Indexes for dashboard and report queries
CREATE INDEX IF NOT EXISTS idx_readings_user_date
ON glucose_readings (user_id, reading_date DESC);

CREATE INDEX IF NOT EXISTS idx_readings_date
ON glucose_readings (reading_date DESC);