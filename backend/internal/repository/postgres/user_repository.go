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

func (r *UserRepository) ListWithDetails(ctx context.Context) ([]*domain.User, error) {
	query := `
		SELECT u.id, u.email, u.full_name, u.phone, u.birthday, u.role, u.active, u.avatar_url, u.notes,
		       COALESCE(u.address, ''), COALESCE(u.profession, ''), COALESCE(u.skills, ''),
		       u.godfather_id, COALESCE(g.full_name, '') as godfather_name,
		       u.prayer_partner_id, COALESCE(pp.full_name, '') as prayer_partner_name,
		       u.created_at, u.updated_at,
		       (SELECT COUNT(*) FROM attendances a WHERE a.user_id = u.id) as att_count,
		       (SELECT COALESCE(SUM(points), 0) FROM points_ledger pl WHERE pl.user_id = u.id AND pl.created_at >= date_trunc('month', CURRENT_DATE)) as month_pts,
		       (SELECT COALESCE(SUM(points), 0) FROM points_ledger pl WHERE pl.user_id = u.id) as total_pts
		FROM users u
		LEFT JOIN users g ON u.godfather_id = g.id
		LEFT JOIN users pp ON u.prayer_partner_id = pp.id
		ORDER BY u.full_name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var totalPastServices int
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM services WHERE scheduled_at < NOW()`).Scan(&totalPastServices)

	var users []*domain.User
	for rows.Next() {
		var u domain.User
		var godfatherID, prayerPartnerID *string
		var godfatherName, prayerPartnerName string
		var attCount, monthPts, totalPts int

		if err := rows.Scan(
			&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Birthday, &u.Role, &u.Active, &u.AvatarURL, &u.Notes,
			&u.Address, &u.Profession, &u.Skills,
			&godfatherID, &godfatherName,
			&prayerPartnerID, &prayerPartnerName,
			&u.CreatedAt, &u.UpdatedAt,
			&attCount, &monthPts, &totalPts,
		); err != nil {
			return nil, err
		}

		u.GodfatherID = godfatherID
		if godfatherName != "" {
			u.GodfatherName = &godfatherName
		}
		u.PrayerPartnerID = prayerPartnerID
		if prayerPartnerName != "" {
			u.PrayerPartnerName = &prayerPartnerName
		}
		u.MonthPoints = monthPts
		u.TotalPoints = totalPts
		if totalPastServices > 0 {
			u.AttendanceRate = (attCount * 100) / totalPastServices
		}
		users = append(users, &u)
	}
	return users, nil
}

func (r *UserRepository) UpdateNotes(ctx context.Context, id, notes string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET notes = $1, updated_at = NOW() WHERE id = $2`, notes, id)
	return err
}

func (r *UserRepository) UpdateProfile(ctx context.Context, u *domain.User) error {
	query := `
		UPDATE users
		SET full_name = $1, phone = $2, birthday = $3, address = $4, profession = $5, skills = $6, avatar_url = $7, updated_at = NOW()
		WHERE id = $8
	`
	_, err := r.pool.Exec(ctx, query, u.FullName, u.Phone, u.Birthday, u.Address, u.Profession, u.Skills, u.AvatarURL, u.ID)
	return err
}

func (r *UserRepository) SetPrayerPartner(ctx context.Context, userID, partnerID string) error {
	_, err := r.pool.Exec(ctx, `UPDATE users SET prayer_partner_id = $1, updated_at = NOW() WHERE id = $2`, partnerID, userID)
	return err
}

func (r *UserRepository) GetBirthdays(ctx context.Context) ([]*domain.User, error) {
	query := `
		SELECT id, email, full_name, phone, birthday, avatar_url, role
		FROM users
		WHERE birthday IS NOT NULL AND active = true
		ORDER BY EXTRACT(MONTH FROM birthday) ASC, EXTRACT(DAY FROM birthday) ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*domain.User
	for rows.Next() {
		var u domain.User
		if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Birthday, &u.AvatarURL, &u.Role); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, nil
}

func (r *UserRepository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	return err
}

