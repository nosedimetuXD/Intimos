package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type CentralRepository struct {
	pool *pgxpool.Pool
}

func NewCentralRepository(pool *pgxpool.Pool) *CentralRepository {
	return &CentralRepository{pool: pool}
}

// Camp Payments
func (r *CentralRepository) RecordCampPayment(ctx context.Context, p *domain.CampPayment) error {
	query := `
		INSERT INTO camp_payments (user_id, amount, payment_date, method, notes, registered_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		p.UserID, p.Amount, p.PaymentDate, p.Method, p.Notes, p.RegisteredBy,
	).Scan(&p.ID, &p.CreatedAt)
}

func (r *CentralRepository) ListCampPayments(ctx context.Context) ([]*domain.CampPayment, error) {
	query := `
		SELECT cp.id, cp.user_id, cp.amount, cp.payment_date, cp.method, cp.notes, cp.registered_by, cp.created_at,
		       u.full_name, reg.full_name
		FROM camp_payments cp
		JOIN users u ON cp.user_id = u.id
		LEFT JOIN users reg ON cp.registered_by = reg.id
		ORDER BY cp.payment_date DESC, cp.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.CampPayment
	for rows.Next() {
		var p domain.CampPayment
		var regName *string
		if err := rows.Scan(
			&p.ID, &p.UserID, &p.Amount, &p.PaymentDate, &p.Method, &p.Notes, &p.RegisteredBy, &p.CreatedAt,
			&p.UserName, &regName,
		); err != nil {
			return nil, err
		}
		if regName != nil {
			p.RegisteredByName = *regName
		}
		list = append(list, &p)
	}
	return list, nil
}

// Finances
func (r *CentralRepository) RecordFinance(ctx context.Context, f *domain.FinanceRecord) error {
	query := `
		INSERT INTO finances (type, amount, category, description, transaction_date, registered_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		f.Type, f.Amount, f.Category, f.Description, f.TransactionDate, f.RegisteredBy,
	).Scan(&f.ID, &f.CreatedAt)
}

func (r *CentralRepository) ListFinances(ctx context.Context) ([]*domain.FinanceRecord, error) {
	query := `
		SELECT f.id, f.type, f.amount, f.category, f.description, f.transaction_date, f.registered_by, f.created_at,
		       u.full_name
		FROM finances f
		LEFT JOIN users u ON f.registered_by = u.id
		ORDER BY f.transaction_date DESC, f.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.FinanceRecord
	for rows.Next() {
		var f domain.FinanceRecord
		var regName *string
		if err := rows.Scan(
			&f.ID, &f.Type, &f.Amount, &f.Category, &f.Description, &f.TransactionDate, &f.RegisteredBy, &f.CreatedAt,
			&regName,
		); err != nil {
			return nil, err
		}
		if regName != nil {
			f.RegisteredByName = *regName
		}
		list = append(list, &f)
	}
	return list, nil
}

// Announcements
func (r *CentralRepository) CreateAnnouncement(ctx context.Context, a *domain.Announcement) error {
	query := `
		INSERT INTO announcements (title, content, priority, active, created_by, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		a.Title, a.Content, a.Priority, a.Active, a.CreatedBy, a.ExpiresAt,
	).Scan(&a.ID, &a.CreatedAt)
}

func (r *CentralRepository) ListActiveAnnouncements(ctx context.Context) ([]*domain.Announcement, error) {
	query := `
		SELECT id, title, content, priority, active, created_by, expires_at, created_at
		FROM announcements
		WHERE active = true AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Announcement
	for rows.Next() {
		var a domain.Announcement
		if err := rows.Scan(
			&a.ID, &a.Title, &a.Content, &a.Priority, &a.Active, &a.CreatedBy, &a.ExpiresAt, &a.CreatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &a)
	}
	return list, nil
}
