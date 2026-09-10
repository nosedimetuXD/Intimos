package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type AttendanceRepository struct {
	pool *pgxpool.Pool
}

func NewAttendanceRepository(pool *pgxpool.Pool) *AttendanceRepository {
	return &AttendanceRepository{pool: pool}
}

func (r *AttendanceRepository) Record(ctx context.Context, a *domain.Attendance) error {
	query := `
		INSERT INTO attendances (service_id, user_id, check_in_time, is_early, checked_in_by, notes, created_at)
		VALUES ($1, $2, NOW(), $3, $4, $5, NOW())
		RETURNING id, check_in_time, created_at
	`
	return r.pool.QueryRow(ctx, query,
		a.ServiceID, a.UserID, a.IsEarly, a.CheckedInBy, a.Notes,
	).Scan(&a.ID, &a.CheckInTime, &a.CreatedAt)
}

func (r *AttendanceRepository) GetByServiceAndUser(ctx context.Context, serviceID, userID string) (*domain.Attendance, error) {
	query := `
		SELECT id, service_id, user_id, check_in_time, is_early, checked_in_by, notes, created_at
		FROM attendances
		WHERE service_id = $1 AND user_id = $2
	`
	var a domain.Attendance
	err := r.pool.QueryRow(ctx, query, serviceID, userID).Scan(
		&a.ID, &a.ServiceID, &a.UserID, &a.CheckInTime, &a.IsEarly, &a.CheckedInBy, &a.Notes, &a.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &a, nil
}

func (r *AttendanceRepository) ListByService(ctx context.Context, serviceID string) ([]*domain.Attendance, error) {
	query := `
		SELECT a.id, a.service_id, a.user_id, a.check_in_time, a.is_early, a.checked_in_by, a.notes, a.created_at,
		       u.full_name, u.email, u.role, s.title
		FROM attendances a
		JOIN users u ON a.user_id = u.id
		JOIN services s ON a.service_id = s.id
		WHERE a.service_id = $1
		ORDER BY a.check_in_time ASC
	`
	rows, err := r.pool.Query(ctx, query, serviceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Attendance
	for rows.Next() {
		var a domain.Attendance
		if err := rows.Scan(
			&a.ID, &a.ServiceID, &a.UserID, &a.CheckInTime, &a.IsEarly, &a.CheckedInBy, &a.Notes, &a.CreatedAt,
			&a.UserName, &a.UserEmail, &a.UserRole, &a.ServiceTitle,
		); err != nil {
			return nil, err
		}
		list = append(list, &a)
	}
	return list, nil
}

func (r *AttendanceRepository) ListByUser(ctx context.Context, userID string) ([]*domain.Attendance, error) {
	query := `
		SELECT a.id, a.service_id, a.user_id, a.check_in_time, a.is_early, a.checked_in_by, a.notes, a.created_at,
		       s.title
		FROM attendances a
		JOIN services s ON a.service_id = s.id
		WHERE a.user_id = $1
		ORDER BY a.check_in_time DESC
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Attendance
	for rows.Next() {
		var a domain.Attendance
		if err := rows.Scan(
			&a.ID, &a.ServiceID, &a.UserID, &a.CheckInTime, &a.IsEarly, &a.CheckedInBy, &a.Notes, &a.CreatedAt,
			&a.ServiceTitle,
		); err != nil {
			return nil, err
		}
		list = append(list, &a)
	}
	return list, nil
}

func (r *AttendanceRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM attendances WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
