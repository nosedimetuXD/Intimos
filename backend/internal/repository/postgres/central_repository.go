package postgres

import (
	"context"
	"encoding/json"
	"fmt"

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

func (r *CentralRepository) ListAllAnnouncements(ctx context.Context) ([]*domain.Announcement, error) {
	query := `
		SELECT id, title, content, priority, active, created_by, expires_at, created_at
		FROM announcements
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

func (r *CentralRepository) UpdateAnnouncement(ctx context.Context, a *domain.Announcement) error {
	query := `
		UPDATE announcements
		SET title = $1, content = $2, priority = $3, active = $4, expires_at = $5
		WHERE id = $6
	`
	_, err := r.pool.Exec(ctx, query, a.Title, a.Content, a.Priority, a.Active, a.ExpiresAt, a.ID)
	return err
}

func (r *CentralRepository) DeleteAnnouncement(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM announcements WHERE id = $1`, id)
	return err
}

// ── SUGGESTIONS (Mi Voz) ───────────────────────────────────────────────────
func (r *CentralRepository) CreateSuggestion(ctx context.Context, s *domain.Suggestion) error {
	query := `
		INSERT INTO suggestions (user_id, category, content, status, feedback, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query, s.UserID, s.Category, s.Content, s.Status, s.Feedback).
		Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
}

func (r *CentralRepository) ListUserSuggestions(ctx context.Context, userID string) ([]*domain.Suggestion, error) {
	query := `
		SELECT s.id, s.user_id, u.full_name, u.email, s.category, s.content, s.status, s.feedback, s.created_at, s.updated_at
		FROM suggestions s
		JOIN users u ON s.user_id = u.id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Suggestion
	for rows.Next() {
		var s domain.Suggestion
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.UserName, &s.UserEmail, &s.Category, &s.Content, &s.Status, &s.Feedback, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &s)
	}
	return list, nil
}

func (r *CentralRepository) ListAllSuggestions(ctx context.Context) ([]*domain.Suggestion, error) {
	query := `
		SELECT s.id, s.user_id, u.full_name, u.email, s.category, s.content, s.status, s.feedback, s.created_at, s.updated_at
		FROM suggestions s
		JOIN users u ON s.user_id = u.id
		ORDER BY s.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Suggestion
	for rows.Next() {
		var s domain.Suggestion
		if err := rows.Scan(
			&s.ID, &s.UserID, &s.UserName, &s.UserEmail, &s.Category, &s.Content, &s.Status, &s.Feedback, &s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &s)
	}
	return list, nil
}

func (r *CentralRepository) UpdateSuggestionStatus(ctx context.Context, id, status, feedback string) error {
	query := `
		UPDATE suggestions
		SET status = $1, feedback = $2, updated_at = NOW()
		WHERE id = $3
	`
	_, err := r.pool.Exec(ctx, query, status, feedback, id)
	return err
}

// ── IDEAS BANK ────────────────────────────────────────────────────────────
func (r *CentralRepository) CreateIdea(ctx context.Context, i *domain.Idea) error {
	tagsJSON, _ := json.Marshal(i.Tags)
	query := `
		INSERT INTO ideas (title, description, category, tags, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, i.Title, i.Description, i.Category, tagsJSON, i.CreatedBy).
		Scan(&i.ID, &i.CreatedAt)
}

func (r *CentralRepository) ListIdeas(ctx context.Context) ([]*domain.Idea, error) {
	query := `
		SELECT i.id, i.title, i.description, i.category, i.tags, i.created_by, i.created_at, COALESCE(u.full_name, '')
		FROM ideas i
		LEFT JOIN users u ON i.created_by = u.id
		ORDER BY i.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Idea
	for rows.Next() {
		var item domain.Idea
		var tagsJSON []byte
		if err := rows.Scan(
			&item.ID, &item.Title, &item.Description, &item.Category, &tagsJSON, &item.CreatedBy, &item.CreatedAt, &item.CreatedByName,
		); err != nil {
			return nil, err
		}
		if len(tagsJSON) > 0 {
			_ = json.Unmarshal(tagsJSON, &item.Tags)
		}
		list = append(list, &item)
	}
	return list, nil
}

func (r *CentralRepository) UpdateIdea(ctx context.Context, i *domain.Idea) error {
	tagsJSON, _ := json.Marshal(i.Tags)
	query := `
		UPDATE ideas
		SET title = $1, description = $2, category = $3, tags = $4
		WHERE id = $5
	`
	_, err := r.pool.Exec(ctx, query, i.Title, i.Description, i.Category, tagsJSON, i.ID)
	return err
}

func (r *CentralRepository) DeleteIdea(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM ideas WHERE id = $1`, id)
	return err
}

// ── WEEKLY CHALLENGES ──────────────────────────────────────────────────────
func (r *CentralRepository) CreateWeeklyChallenge(ctx context.Context, c *domain.WeeklyChallenge) error {
	query := `
		INSERT INTO weekly_challenges (title, description, points, active, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, c.Title, c.Description, c.Points, c.Active, c.CreatedBy).
		Scan(&c.ID, &c.CreatedAt)
}

func (r *CentralRepository) ListWeeklyChallenges(ctx context.Context, currentUserID string) ([]*domain.WeeklyChallenge, error) {
	query := `
		SELECT c.id, c.title, c.description, c.points, c.active, c.created_by, c.created_at,
		       (SELECT COUNT(*) FROM weekly_challenge_completions cc WHERE cc.challenge_id = c.id) as comp_count,
		       EXISTS(SELECT 1 FROM weekly_challenge_completions cc WHERE cc.challenge_id = c.id AND cc.user_id = $1) as comp_by_me
		FROM weekly_challenges c
		ORDER BY c.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, currentUserID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.WeeklyChallenge
	for rows.Next() {
		var c domain.WeeklyChallenge
		if err := rows.Scan(
			&c.ID, &c.Title, &c.Description, &c.Points, &c.Active, &c.CreatedBy, &c.CreatedAt, &c.CompletedCount, &c.CompletedByMe,
		); err != nil {
			return nil, err
		}
		list = append(list, &c)
	}
	return list, nil
}

func (r *CentralRepository) GetActiveWeeklyChallenge(ctx context.Context, currentUserID string) (*domain.WeeklyChallenge, error) {
	query := `
		SELECT c.id, c.title, c.description, c.points, c.active, c.created_by, c.created_at,
		       (SELECT COUNT(*) FROM weekly_challenge_completions cc WHERE cc.challenge_id = c.id) as comp_count,
		       EXISTS(SELECT 1 FROM weekly_challenge_completions cc WHERE cc.challenge_id = c.id AND cc.user_id = $1) as comp_by_me
		FROM weekly_challenges c
		WHERE c.active = true
		ORDER BY c.created_at DESC
		LIMIT 1
	`
	var c domain.WeeklyChallenge
	err := r.pool.QueryRow(ctx, query, currentUserID).Scan(
		&c.ID, &c.Title, &c.Description, &c.Points, &c.Active, &c.CreatedBy, &c.CreatedAt, &c.CompletedCount, &c.CompletedByMe,
	)
	if err != nil {
		return nil, nil // None active
	}
	return &c, nil
}

func (r *CentralRepository) ToggleWeeklyChallenge(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE weekly_challenges SET active = NOT active WHERE id = $1`, id)
	return err
}

func (r *CentralRepository) CompleteWeeklyChallenge(ctx context.Context, challengeID, userID string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO weekly_challenge_completions (challenge_id, user_id, completed_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (challenge_id, user_id) DO NOTHING
	`, challengeID, userID)
	return err
}

// ── GROUPS / CÉLULAS ──────────────────────────────────────────────────────
func (r *CentralRepository) CreateGroup(ctx context.Context, g *domain.Group) error {
	query := `
		INSERT INTO groups (name, leader_id, description, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, g.Name, g.LeaderID, g.Description).Scan(&g.ID, &g.CreatedAt)
}

func (r *CentralRepository) ListGroups(ctx context.Context) ([]*domain.Group, error) {
	query := `
		SELECT g.id, g.name, g.leader_id, COALESCE(u.full_name, '') as leader_name, g.description, g.created_at,
		       COUNT(gm.user_id) as member_count
		FROM groups g
		LEFT JOIN users u ON g.leader_id = u.id
		LEFT JOIN group_members gm ON g.id = gm.group_id
		GROUP BY g.id, g.name, g.leader_id, u.full_name, g.description, g.created_at
		ORDER BY g.name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Group
	for rows.Next() {
		var g domain.Group
		if err := rows.Scan(
			&g.ID, &g.Name, &g.LeaderID, &g.LeaderName, &g.Description, &g.CreatedAt, &g.MemberCount,
		); err != nil {
			return nil, err
		}
		g.Members = []domain.User{}
		list = append(list, &g)
	}

	// Fetch members for each group
	for _, g := range list {
		memQuery := `
			SELECT u.id, u.email, u.full_name, u.phone, u.role, u.active, u.avatar_url, u.notes
			FROM users u
			JOIN group_members gm ON u.id = gm.user_id
			WHERE gm.group_id = $1
			ORDER BY u.full_name ASC
		`
		memRows, err := r.pool.Query(ctx, memQuery, g.ID)
		if err == nil {
			for memRows.Next() {
				var u domain.User
				_ = memRows.Scan(&u.ID, &u.Email, &u.FullName, &u.Phone, &u.Role, &u.Active, &u.AvatarURL, &u.Notes)
				g.Members = append(g.Members, u)
			}
			memRows.Close()
		}
	}

	return list, nil
}

func (r *CentralRepository) UpdateGroup(ctx context.Context, g *domain.Group) error {
	query := `
		UPDATE groups
		SET name = $1, leader_id = $2, description = $3
		WHERE id = $4
	`
	_, err := r.pool.Exec(ctx, query, g.Name, g.LeaderID, g.Description, g.ID)
	return err
}

func (r *CentralRepository) AddGroupMember(ctx context.Context, groupID, userID string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO group_members (group_id, user_id, joined_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (group_id, user_id) DO NOTHING
	`, groupID, userID)
	return err
}

func (r *CentralRepository) RemoveGroupMember(ctx context.Context, groupID, userID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, groupID, userID)
	return err
}

func (r *CentralRepository) DeleteGroup(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM groups WHERE id = $1`, id)
	return err
}

// ── PLAYLISTS ─────────────────────────────────────────────────────────────
func (r *CentralRepository) CreatePlaylist(ctx context.Context, p *domain.Playlist) error {
	query := `
		INSERT INTO playlists (title, description, url, cover_url, active, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, p.Title, p.Description, p.URL, p.CoverURL, p.Active).
		Scan(&p.ID, &p.CreatedAt)
}

func (r *CentralRepository) ListPlaylists(ctx context.Context) ([]*domain.Playlist, error) {
	query := `
		SELECT id, title, description, url, cover_url, active, created_at
		FROM playlists
		WHERE active = true
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Playlist
	for rows.Next() {
		var p domain.Playlist
		if err := rows.Scan(
			&p.ID, &p.Title, &p.Description, &p.URL, &p.CoverURL, &p.Active, &p.CreatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &p)
	}
	return list, nil
}

func (r *CentralRepository) DeletePlaylist(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM playlists WHERE id = $1`, id)
	return err
}

// ── FEATURE FLAGS ──────────────────────────────────────────────────────────
func (r *CentralRepository) ListFeatureFlags(ctx context.Context) ([]*domain.FeatureFlag, error) {
	query := `
		SELECT id, key, name, description, enabled_roles, active
		FROM feature_flags
		ORDER BY name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.FeatureFlag
	for rows.Next() {
		var f domain.FeatureFlag
		var rolesJSON []byte
		if err := rows.Scan(&f.ID, &f.Key, &f.Name, &f.Description, &rolesJSON, &f.Active); err != nil {
			return nil, err
		}
		if len(rolesJSON) > 0 {
			_ = json.Unmarshal(rolesJSON, &f.EnabledRoles)
		}
		list = append(list, &f)
	}
	return list, nil
}

func (r *CentralRepository) SaveFeatureFlag(ctx context.Context, f *domain.FeatureFlag) error {
	rolesJSON, _ := json.Marshal(f.EnabledRoles)
	query := `
		INSERT INTO feature_flags (key, name, description, enabled_roles, active)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (key) DO UPDATE
		SET name = EXCLUDED.name, description = EXCLUDED.description,
		    enabled_roles = EXCLUDED.enabled_roles, active = EXCLUDED.active
	`
	_, err := r.pool.Exec(ctx, query, f.Key, f.Name, f.Description, rolesJSON, f.Active)
	return err
}

// ── SYSTEM SETTINGS & POINTS CONFIG ───────────────────────────────────────
func (r *CentralRepository) GetSetting(ctx context.Context, key string) (map[string]interface{}, error) {
	var valJSON []byte
	err := r.pool.QueryRow(ctx, `SELECT value FROM system_settings WHERE key = $1`, key).Scan(&valJSON)
	if err != nil {
		return map[string]interface{}{}, nil
	}
	var res map[string]interface{}
	_ = json.Unmarshal(valJSON, &res)
	return res, nil
}

func (r *CentralRepository) SaveSetting(ctx context.Context, key string, val map[string]interface{}) error {
	valJSON, _ := json.Marshal(val)
	query := `
		INSERT INTO system_settings (key, value, updated_at)
		VALUES ($1, $2, NOW())
		ON CONFLICT (key) DO UPDATE
		SET value = EXCLUDED.value, updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, key, valJSON)
	return err
}

// ── CAMP SUMMARY (Llega Temprano, Paga Menos) ──────────────────────────────
func (r *CentralRepository) GetCampSummary(ctx context.Context) (*domain.CampSummary, error) {
	summary := &domain.CampSummary{
		BasePrice:   190000,
		EarlyBonus:  5000,
		TotalGoal:   0,
		TotalRaised: 0,
		Users:       []domain.CampSummaryUser{},
	}

	// Fetch users with their attendance and camp payments
	query := `
		SELECT u.id, u.full_name, u.avatar_url, u.role,
		       COUNT(DISTINCT a.id) as services_count,
		       COUNT(DISTINCT CASE WHEN a.is_early THEN a.id END) as punctual_count,
		       COALESCE(SUM(cp.amount), 0) as total_paid
		FROM users u
		LEFT JOIN attendances a ON u.id = a.user_id
		LEFT JOIN camp_payments cp ON u.id = cp.user_id
		WHERE u.active = true
		GROUP BY u.id, u.full_name, u.avatar_url, u.role
		ORDER BY u.full_name ASC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return summary, err
	}
	defer rows.Close()

	for rows.Next() {
		var u domain.CampSummaryUser
		if err := rows.Scan(
			&u.UserID, &u.FullName, &u.AvatarURL, &u.Role,
			&u.ServicesCount, &u.PunctualCount, &u.TotalPaid,
		); err != nil {
			return summary, err
		}
		u.BasePrice = summary.BasePrice
		u.DiscountEarned = float64(u.PunctualCount) * summary.EarlyBonus
		u.FinalPrice = u.BasePrice - u.DiscountEarned
		if u.FinalPrice < 0 {
			u.FinalPrice = 0
		}
		u.Remaining = u.FinalPrice - u.TotalPaid
		if u.Remaining < 0 {
			u.Remaining = 0
		}

		summary.TotalGoal += u.FinalPrice
		summary.TotalRaised += u.TotalPaid
		summary.Users = append(summary.Users, u)
	}

	return summary, nil
}

func (r *CentralRepository) DeleteCampPayment(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM camp_payments WHERE id = $1`, id)
	return err
}

func (r *CentralRepository) DeleteFinance(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM finances WHERE id = $1`, id)
	return err
}

// ── REFLECTIONS REVIEW & MODERATION ────────────────────────────────────────
func (r *CentralRepository) ListReflections(ctx context.Context, onlyPublic bool) ([]*domain.Reflection, error) {
	where := ""
	if onlyPublic {
		where = "WHERE r.is_public = true"
	}
	query := fmt.Sprintf(`
		SELECT r.id, r.user_id, COALESCE(u.full_name, '') as user_name, r.verse_ref,
		       r.content, r.status, r.feedback, r.is_public, r.reviewed_by, r.created_at, r.updated_at
		FROM reflections r
		JOIN users u ON r.user_id = u.id
		%s
		ORDER BY r.created_at DESC
	`, where)

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*domain.Reflection
	for rows.Next() {
		var item domain.Reflection
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.UserName, &item.VerseRef,
			&item.Content, &item.Status, &item.Feedback, &item.IsPublic,
			&item.ReviewedBy, &item.CreatedAt, &item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, &item)
	}
	return list, nil
}

func (r *CentralRepository) CreateReflection(ctx context.Context, ref *domain.Reflection) error {
	query := `
		INSERT INTO reflections (user_id, verse_ref, content, status, is_public, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`
	return r.pool.QueryRow(ctx, query, ref.UserID, ref.VerseRef, ref.Content, ref.Status, ref.IsPublic).
		Scan(&ref.ID, &ref.CreatedAt, &ref.UpdatedAt)
}

func (r *CentralRepository) ModerateReflection(ctx context.Context, id, status, feedback string, isPublic bool, reviewerID string) error {
	query := `
		UPDATE reflections
		SET status = $1, feedback = $2, is_public = $3, reviewed_by = $4, updated_at = NOW()
		WHERE id = $5
	`
	_, err := r.pool.Exec(ctx, query, status, feedback, isPublic, reviewerID, id)
	return err
}

// ── GAME ANALYTICS ─────────────────────────────────────────────────────────
func (r *CentralRepository) GetGameAnalytics(ctx context.Context) ([]*domain.GameAnalytics, error) {
	query := `
		SELECT game_type,
		       COUNT(*) as total_attempts,
		       COALESCE(AVG(score), 0) as avg_score,
		       COALESCE(AVG(time_spent_sec), 0) as avg_time,
		       COALESCE(AVG(CASE WHEN score >= max_score AND max_score > 0 THEN 100 ELSE 0 END), 0) as accuracy_rate
		FROM game_attempts
		GROUP BY game_type
		ORDER BY total_attempts DESC
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	names := map[domain.GameType]string{
		domain.GameVersoFlash:     "Verso Flash",
		domain.GameQueHarias:      "¿Qué Harías?",
		domain.GameReto60:         "Reto 60 Segundos",
		domain.GameVerdaderoFalso: "Verdadero o Falso",
		domain.GameAhorcado:       "Ahorcado Bíblico",
		domain.GameOrdenaVerso:    "Ordena el Versículo",
	}

	var list []*domain.GameAnalytics
	for rows.Next() {
		var a domain.GameAnalytics
		if err := rows.Scan(&a.GameType, &a.TotalAttempts, &a.AverageScore, &a.AverageTimeSec, &a.AccuracyRate); err != nil {
			return nil, err
		}
		a.GameName = names[a.GameType]
		if a.GameName == "" {
			a.GameName = string(a.GameType)
		}
		list = append(list, &a)
	}
	return list, nil
}

// ── CENTRAL STATS ──────────────────────────────────────────────────────────
func (r *CentralRepository) GetCentralStats(ctx context.Context) (map[string]interface{}, error) {
	stats := make(map[string]interface{})
	var usersCount, servicesCount, attendancesCount int
	var totalFinances float64

	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE active = true`).Scan(&usersCount)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM services`).Scan(&servicesCount)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM attendances`).Scan(&attendancesCount)
	_ = r.pool.QueryRow(ctx, `SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) FROM finances`).Scan(&totalFinances)

	stats["active_users"] = usersCount
	stats["total_services"] = servicesCount
	stats["total_attendances"] = attendancesCount
	stats["treasury_balance"] = totalFinances
	return stats, nil
}
