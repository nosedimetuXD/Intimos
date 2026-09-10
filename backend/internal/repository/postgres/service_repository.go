package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type ServiceRepository struct {
	pool *pgxpool.Pool
}

func NewServiceRepository(pool *pgxpool.Pool) *ServiceRepository {
	return &ServiceRepository{pool: pool}
}

func (r *ServiceRepository) Create(ctx context.Context, s *domain.Service) error {
	query := `
		INSERT INTO services (title, scheduled_at, status, location, description, feedback_prompt, qr_token, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		s.Title, s.ScheduledAt, s.Status, s.Location, s.Description, s.FeedbackPrompt, s.QRToken,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
}

func (r *ServiceRepository) GetByID(ctx context.Context, id string) (*domain.Service, error) {
	query := `
		SELECT id, title, scheduled_at, status, location, description, feedback_prompt, qr_token, created_at, updated_at
		FROM services
		WHERE id = $1
	`
	var s domain.Service
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&s.ID, &s.Title, &s.ScheduledAt, &s.Status, &s.Location, &s.Description, &s.FeedbackPrompt, &s.QRToken, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *ServiceRepository) List(ctx context.Context) ([]*domain.Service, error) {
	query := `
		SELECT id, title, scheduled_at, status, location, description, feedback_prompt, qr_token, created_at, updated_at
		FROM services
		ORDER BY scheduled_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var services []*domain.Service
	now := time.Now()
	for rows.Next() {
		var s domain.Service
		if err := rows.Scan(
			&s.ID, &s.Title, &s.ScheduledAt, &s.Status, &s.Location, &s.Description, &s.FeedbackPrompt, &s.QRToken, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		// Fix B7 from audit: Automatically calculate past status based on time if past
		if s.Status == domain.ServiceUpcoming && s.ScheduledAt.Before(now.Add(-6*time.Hour)) {
			s.Status = domain.ServicePast
		}
		services = append(services, &s)
	}
	return services, nil
}

func (r *ServiceRepository) GetUpcoming(ctx context.Context) (*domain.Service, error) {
	query := `
		SELECT id, title, scheduled_at, status, location, description, feedback_prompt, qr_token, created_at, updated_at
		FROM services
		WHERE scheduled_at >= NOW() - INTERVAL '3 hours' AND status != 'cancelled'
		ORDER BY scheduled_at ASC
		LIMIT 1
	`
	var s domain.Service
	err := r.pool.QueryRow(ctx, query).Scan(
		&s.ID, &s.Title, &s.ScheduledAt, &s.Status, &s.Location, &s.Description, &s.FeedbackPrompt, &s.QRToken, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *ServiceRepository) Update(ctx context.Context, s *domain.Service) error {
	query := `
		UPDATE services
		SET title = $1, scheduled_at = $2, status = $3, location = $4, description = $5, feedback_prompt = $6, qr_token = $7, updated_at = NOW()
		WHERE id = $8
	`
	_, err := r.pool.Exec(ctx, query, s.Title, s.ScheduledAt, s.Status, s.Location, s.Description, s.FeedbackPrompt, s.QRToken, s.ID)
	return err
}

func (r *ServiceRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM services WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}
