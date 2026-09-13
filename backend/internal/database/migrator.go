package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

const schemaSQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    birthday DATE,
    invited_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'miembro',
    active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    location VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    feedback_prompt TEXT DEFAULT '',
    qr_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_early BOOLEAN DEFAULT false,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_service_user UNIQUE (service_id, user_id)
);

CREATE TABLE IF NOT EXISTS points_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer TEXT NOT NULL,
    bible_ref VARCHAR(255) NOT NULL,
    explanation TEXT DEFAULT '',
    difficulty INT DEFAULT 1,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    points_awarded INT NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT true,
    time_spent_sec INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    target_value INT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_exclusive BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_ref VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    feedback TEXT DEFAULT '',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS camp_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method VARCHAR(50) DEFAULT 'efectivo',
    notes TEXT DEFAULT '',
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_pulses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pulse_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reflection_done BOOLEAN DEFAULT false,
    trivia_done BOOLEAN DEFAULT false,
    trivia_correct BOOLEAN DEFAULT false,
    trivia_selected INT,
    prayer_done BOOLEAN DEFAULT false,
    prayer_text TEXT DEFAULT '',
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_user_pulse_date UNIQUE (user_id, pulse_date)
);

CREATE INDEX IF NOT EXISTS idx_attendances_service ON attendances(service_id);
CREATE INDEX IF NOT EXISTS idx_attendances_user ON attendances(user_id);
CREATE INDEX IF NOT EXISTS idx_points_user ON points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_points_created ON points_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_game_attempts_user_date ON game_attempts(user_id, played_at);
CREATE INDEX IF NOT EXISTS idx_daily_pulses_user_date ON daily_pulses(user_id, pulse_date);

-- Schema extensions for full feature replication
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS godfather_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS prayer_partner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'regular';
ALTER TABLE services ADD COLUMN IF NOT EXISTS preacher VARCHAR(255) DEFAULT '';
ALTER TABLE reflections ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'recibida',
    feedback TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points INT NOT NULL DEFAULT 150,
    active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_challenge_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES weekly_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_challenge_user UNIQUE (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_group_user UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    url TEXT NOT NULL,
    cover_url TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    enabled_roles JSONB NOT NULL DEFAULT '["miembro","lider","apoyo","apoyo2","pastoral","superadmin"]'::jsonb,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, schemaSQL)
	if err != nil {
		return fmt.Errorf("error executing database migrations: %w", err)
	}
	log.Println("✅ Database migrations applied successfully")
	return nil
}
