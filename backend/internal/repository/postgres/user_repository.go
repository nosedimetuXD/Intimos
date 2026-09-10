package postgres

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) Create(ctx context.Context, u *domain.User) error {
	query := `
		INSERT INTO users (email, password_hash, full_name, phone, birthday, invited_by_id, role, active, avatar_url, notes, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query,
		u.Email, u.PasswordHash, u.FullName, u.Phone, u.Birthday, u.InvitedByID, u.Role, u.Active, u.AvatarURL, u.Notes,
	).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	query := `
		SELECT id, email, password_hash, full_name, phone, birthday, invited_by_id, role, active, avatar_url, notes, created_at, updated_at
		FROM users
		WHERE LOWER(email) = LOWER($1)
	`
	var u domain.User
	err := r.pool.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.Birthday, &u.InvitedByID, &u.Role, &u.Active, &u.AvatarURL, &u.Notes, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	query := `
		SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.birthday, u.invited_by_id, u.role, u.active, u.avatar_url, u.notes, u.created_at, u.updated_at,
		       COALESCE(inv.full_name, '') as invited_by_name
		FROM users u
		LEFT JOIN users inv ON u.invited_by_id = inv.id
		WHERE u.id = $1
	`
	var u domain.User
	var invitedByName string
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Phone, &u.Birthday, &u.InvitedByID, &u.Role, &u.Active, &u.AvatarURL, &u.Notes, &u.CreatedAt, &u.UpdatedAt, &invitedByName,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	if invitedByName != "" {
		u.InvitedBy = &invitedByName
	}
	return &u, nil
}

func (r *UserRepository) List(ctx context.Context) ([]*domain.User, error) {
	query := `
		SELECT u.id, u.email, u.full_name, u.phone, u.birthday, u.invited_by_id, u.role, u.active, u.avatar_url, u.notes, u.created_at, u.updated_at,
		       COALESCE(inv.full_name, '') as invited_by_name
		FROM users u
		LEFT JOIN users inv ON u.invited_by_id = inv.id
		ORDER BY u.full_name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		var u domain.User
		var invitedByName string
		if err := rows.Scan(
			&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Birthday, &u.InvitedByID, &u.Role, &u.Active, &u.AvatarURL, &u.Notes, &u.CreatedAt, &u.UpdatedAt, &invitedByName,
		); err != nil {
			return nil, err
		}
		if invitedByName != "" {
			u.InvitedBy = &invitedByName
		}
		users = append(users, &u)
	}
	return users, nil
}

func (r *UserRepository) Update(ctx context.Context, u *domain.User) error {
	query := `
		UPDATE users
		SET full_name = $1, phone = $2, birthday = $3, avatar_url = $4, notes = $5, role = $6, active = $7, updated_at = NOW()
		WHERE id = $8
	`
	_, err := r.pool.Exec(ctx, query, u.FullName, u.Phone, u.Birthday, u.AvatarURL, u.Notes, u.Role, u.Active, u.ID)
	return err
}

func (r *UserRepository) UpdatePassword(ctx context.Context, id, passwordHash string) error {
	query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.pool.Exec(ctx, query, passwordHash, id)
	return err
}
