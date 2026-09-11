package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type PulseRepository struct {
	pool *pgxpool.Pool
}

func NewPulseRepository(pool *pgxpool.Pool) *PulseRepository {
	return &PulseRepository{pool: pool}
}

func (r *PulseRepository) GetTodayPulse(ctx context.Context, userID string) (*domain.DailyPulse, error) {
	query := `
		SELECT id, user_id, pulse_date, reflection_done, trivia_done, trivia_correct,
		       trivia_selected, prayer_done, prayer_text, points_awarded, created_at, updated_at
		FROM daily_pulses
		WHERE user_id = $1 AND pulse_date = CURRENT_DATE
	`
	var p domain.DailyPulse
	err := r.pool.QueryRow(ctx, query, userID).Scan(
		&p.ID, &p.UserID, &p.PulseDate, &p.ReflectionDone, &p.TriviaDone, &p.TriviaCorrect,
		&p.TriviaSelected, &p.PrayerDone, &p.PrayerText, &p.PointsAwarded, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *PulseRepository) UpsertPulse(ctx context.Context, p *domain.DailyPulse) error {
	query := `
		INSERT INTO daily_pulses (
			user_id, pulse_date, reflection_done, trivia_done, trivia_correct,
			trivia_selected, prayer_done, prayer_text, points_awarded, created_at, updated_at
		) VALUES (
			$1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
		)
		ON CONFLICT (user_id, pulse_date) DO UPDATE SET
			reflection_done = EXCLUDED.reflection_done,
			trivia_done = EXCLUDED.trivia_done,
			trivia_correct = EXCLUDED.trivia_correct,
			trivia_selected = EXCLUDED.trivia_selected,
			prayer_done = EXCLUDED.prayer_done,
			prayer_text = EXCLUDED.prayer_text,
			points_awarded = EXCLUDED.points_awarded,
			updated_at = NOW()
		RETURNING id, pulse_date, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		p.UserID, p.ReflectionDone, p.TriviaDone, p.TriviaCorrect,
		p.TriviaSelected, p.PrayerDone, p.PrayerText, p.PointsAwarded,
	).Scan(&p.ID, &p.PulseDate, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PulseRepository) GetActiveStreak(ctx context.Context, userID string) (int, error) {
	query := `
		WITH active_days AS (
			SELECT DISTINCT pulse_date
			FROM daily_pulses
			WHERE user_id = $1 AND (reflection_done = true OR trivia_done = true OR prayer_done = true)
			ORDER BY pulse_date DESC
		),
		numbered AS (
			SELECT pulse_date,
			       pulse_date - (ROW_NUMBER() OVER (ORDER BY pulse_date DESC) - 1) * INTERVAL '1 day' AS grp
			FROM active_days
			WHERE pulse_date >= CURRENT_DATE - INTERVAL '1 day'
		)
		SELECT COUNT(*)
		FROM numbered
		WHERE grp = (SELECT grp FROM numbered ORDER BY pulse_date DESC LIMIT 1)
	`
	var streak int
	err := r.pool.QueryRow(ctx, query, userID).Scan(&streak)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, nil
	}
	return streak, nil
}

func (r *PulseRepository) GetPointsAwardedToday(ctx context.Context, userID string) (int, error) {
	query := `
		SELECT COALESCE(points_awarded, 0)
		FROM daily_pulses
		WHERE user_id = $1 AND pulse_date = CURRENT_DATE
	`
	var pts int
	err := r.pool.QueryRow(ctx, query, userID).Scan(&pts)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, nil
		}
		return 0, err
	}
	return pts, nil
}
