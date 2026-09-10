package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type PointsRepository struct {
	pool *pgxpool.Pool
}

func NewPointsRepository(pool *pgxpool.Pool) *PointsRepository {
	return &PointsRepository{pool: pool}
}

func (r *PointsRepository) Add(ctx context.Context, p *domain.PointsLedger) error {
	query := `
		INSERT INTO points_ledger (user_id, points, reason, category, granted_by, service_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		p.UserID, p.Points, p.Reason, p.Category, p.GrantedBy, p.ServiceID,
	).Scan(&p.ID, &p.CreatedAt)
}

func (r *PointsRepository) GetDailyGamePoints(ctx context.Context, userID string, date time.Time) (int, error) {
	query := `
		SELECT COALESCE(SUM(points), 0)
		FROM points_ledger
		WHERE user_id = $1 AND category = 'game' AND points > 0
		  AND DATE(created_at AT TIME ZONE 'UTC') = DATE($2 AT TIME ZONE 'UTC')
	`
	var sum int
	err := r.pool.QueryRow(ctx, query, userID, date).Scan(&sum)
	return sum, err
}

func (r *PointsRepository) GetMonthlyGamePoints(ctx context.Context, userID string, year int, month time.Month) (int, error) {
	query := `
		SELECT COALESCE(SUM(points), 0)
		FROM points_ledger
		WHERE user_id = $1 AND category = 'game' AND points > 0
		  AND EXTRACT(YEAR FROM created_at) = $2
		  AND EXTRACT(MONTH FROM created_at) = $3
	`
	var sum int
	err := r.pool.QueryRow(ctx, query, userID, year, int(month)).Scan(&sum)
	return sum, err
}

func (r *PointsRepository) GetUserPointsSummary(ctx context.Context, userID string) (totalPts int, monthPts int, err error) {
	now := time.Now()
	query := `
		SELECT
			COALESCE(SUM(points), 0) AS total_points,
			COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM created_at) = $2 AND EXTRACT(MONTH FROM created_at) = $3 THEN points ELSE 0 END), 0) AS month_points
		FROM points_ledger
		WHERE user_id = $1
	`
	err = r.pool.QueryRow(ctx, query, userID, now.Year(), int(now.Month())).Scan(&totalPts, &monthPts)
	return totalPts, monthPts, err
}

func (r *PointsRepository) GetMonthlyRanking(ctx context.Context, year int, month time.Month) ([]*domain.UserRanking, error) {
	query := `
		SELECT 
			u.id, 
			u.full_name, 
			u.avatar_url, 
			u.role,
			COALESCE(SUM(CASE WHEN EXTRACT(YEAR FROM pl.created_at) = $1 AND EXTRACT(MONTH FROM pl.created_at) = $2 THEN pl.points ELSE 0 END), 0) AS month_points,
			COALESCE(SUM(pl.points), 0) AS total_points
		FROM users u
		LEFT JOIN points_ledger pl ON u.id = pl.user_id
		WHERE u.active = true
		GROUP BY u.id, u.full_name, u.avatar_url, u.role
		ORDER BY month_points DESC, total_points DESC, u.full_name ASC
	`
	rows, err := r.pool.Query(ctx, query, year, int(month))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rankings []*domain.UserRanking
	rank := 1
	for rows.Next() {
		var ur domain.UserRanking
		if err := rows.Scan(
			&ur.UserID, &ur.FullName, &ur.AvatarURL, &ur.Role, &ur.MonthPoints, &ur.TotalPoints,
		); err != nil {
			return nil, err
		}
		ur.Rank = rank
		ur.Level = CalculateLevel(ur.TotalPoints)
		rankings = append(rankings, &ur)
		rank++
	}
	return rankings, nil
}

func (r *PointsRepository) GetHistory(ctx context.Context, userID string, limit int) ([]*domain.PointsLedger, error) {
	query := `
		SELECT id, user_id, points, reason, category, granted_by, service_id, created_at
		FROM points_ledger
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.PointsLedger
	for rows.Next() {
		var p domain.PointsLedger
		if err := rows.Scan(
			&p.ID, &p.UserID, &p.Points, &p.Reason, &p.Category, &p.GrantedBy, &p.ServiceID, &p.CreatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &p)
	}
	return list, nil
}

// Unified level progression (Fixing audit B5)
func CalculateLevel(totalPoints int) string {
	switch {
	case totalPoints >= 10000:
		return "Portador de Luz"
	case totalPoints >= 5000:
		return "Mentor"
	case totalPoints >= 2500:
		return "Guerrero"
	case totalPoints >= 1000:
		return "Discípulo"
	default:
		return "Semilla"
	}
}
