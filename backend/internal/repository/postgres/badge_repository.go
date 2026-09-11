package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type UserStatsForBadges struct {
	AttendanceCount      int
	EarlyAttendanceCount int
	ReflectionsCount     int
	GameAttemptsCount    int
	PerfectGamesCount    int
	InviteCount          int
	CampPaid             bool
	Role                 string
	CurrentRank          int
	ConsecutiveStreak    int
}

type BadgeRepository struct {
	pool *pgxpool.Pool
}

func NewBadgeRepository(pool *pgxpool.Pool) *BadgeRepository {
	return &BadgeRepository{pool: pool}
}

func (r *BadgeRepository) ListAll(ctx context.Context) ([]*domain.Badge, error) {
	query := `
		SELECT id, slug, name, description, category, target_value, icon, is_exclusive
		FROM badges
		ORDER BY category ASC, target_value ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Badge
	for rows.Next() {
		var b domain.Badge
		if err := rows.Scan(
			&b.ID, &b.Slug, &b.Name, &b.Description, &b.Category, &b.TargetValue, &b.Icon, &b.IsExclusive,
		); err != nil {
			return nil, err
		}
		list = append(list, &b)
	}
	return list, nil
}

func (r *BadgeRepository) GetUserUnlockedBadges(ctx context.Context, userID string) (map[string]time.Time, error) {
	query := `
		SELECT b.slug, ub.unlocked_at
		FROM user_badges ub
		JOIN badges b ON ub.badge_id = b.id
		WHERE ub.user_id = $1
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]time.Time)
	for rows.Next() {
		var slug string
		var unlockedAt time.Time
		if err := rows.Scan(&slug, &unlockedAt); err != nil {
			return nil, err
		}
		result[slug] = unlockedAt
	}
	return result, nil
}

func (r *BadgeRepository) UnlockBadge(ctx context.Context, userID, badgeSlug string) error {
	query := `
		INSERT INTO user_badges (user_id, badge_id, unlocked_at)
		SELECT $1, id, NOW()
		FROM badges
		WHERE slug = $2
		ON CONFLICT (user_id, badge_id) DO NOTHING
	`
	_, err := r.pool.Exec(ctx, query, userID, badgeSlug)
	return err
}

func (r *BadgeRepository) UpsertBadge(ctx context.Context, b *domain.Badge) error {
	query := `
		INSERT INTO badges (slug, name, description, category, target_value, icon, is_exclusive)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (slug) DO UPDATE SET
			name = EXCLUDED.name,
			description = EXCLUDED.description,
			category = EXCLUDED.category,
			target_value = EXCLUDED.target_value,
			icon = EXCLUDED.icon,
			is_exclusive = EXCLUDED.is_exclusive
		RETURNING id
	`
	return r.pool.QueryRow(ctx, query,
		b.Slug, b.Name, b.Description, b.Category, b.TargetValue, b.Icon, b.IsExclusive,
	).Scan(&b.ID)
}

func (r *BadgeRepository) GetUserStats(ctx context.Context, userID string) (*UserStatsForBadges, error) {
	stats := &UserStatsForBadges{}

	// 1. Attendance
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(CASE WHEN is_early = true THEN 1 END)
		FROM attendances
		WHERE user_id = $1
	`, userID).Scan(&stats.AttendanceCount, &stats.EarlyAttendanceCount)

	// 2. Reflections
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM reflections
		WHERE user_id = $1
	`, userID).Scan(&stats.ReflectionsCount)

	// 3. Games
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(CASE WHEN score >= max_score AND max_score > 0 THEN 1 END)
		FROM game_attempts
		WHERE user_id = $1
	`, userID).Scan(&stats.GameAttemptsCount, &stats.PerfectGamesCount)

	// 4. Invites
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM users
		WHERE invited_by_id = $1
	`, userID).Scan(&stats.InviteCount)

	// 5. Camp Paid
	var campCount int
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM camp_payments
		WHERE user_id = $1
	`, userID).Scan(&campCount)
	stats.CampPaid = campCount > 0

	// 6. Role
	var role string
	_ = r.pool.QueryRow(ctx, `
		SELECT role FROM users WHERE id = $1
	`, userID).Scan(&role)
	stats.Role = role

	// 7. Ranking (month rank)
	now := time.Now()
	queryRank := `
		WITH ranks AS (
			SELECT user_id,
			       DENSE_RANK() OVER (ORDER BY SUM(points) DESC) as rk
			FROM points_ledger
			WHERE EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2
			GROUP BY user_id
		)
		SELECT COALESCE((SELECT rk FROM ranks WHERE user_id = $3), 999)
	`
	_ = r.pool.QueryRow(ctx, queryRank, now.Year(), int(now.Month()), userID).Scan(&stats.CurrentRank)

	return stats, nil
}
