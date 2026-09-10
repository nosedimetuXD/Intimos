package postgres

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
	"intimos/backend/internal/domain"
)

type GameRepository struct {
	pool *pgxpool.Pool
}

func NewGameRepository(pool *pgxpool.Pool) *GameRepository {
	return &GameRepository{pool: pool}
}

func (r *GameRepository) GetQuestions(ctx context.Context, gameType domain.GameType, limit int) ([]*domain.GameQuestion, error) {
	query := `
		SELECT id, game_type, question, options, correct_answer, bible_ref, explanation, difficulty, active, created_at
		FROM game_questions
		WHERE game_type = $1 AND active = true
		ORDER BY RANDOM()
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, gameType, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []*domain.GameQuestion
	for rows.Next() {
		var q domain.GameQuestion
		var optionsRaw []byte
		if err := rows.Scan(
			&q.ID, &q.GameType, &q.Question, &optionsRaw, &q.CorrectAnswer, &q.BibleRef, &q.Explanation, &q.Difficulty, &q.Active, &q.CreatedAt,
		); err != nil {
			return nil, err
		}
		if len(optionsRaw) > 0 {
			_ = json.Unmarshal(optionsRaw, &q.Options)
		}
		questions = append(questions, &q)
	}
	return questions, nil
}

func (r *GameRepository) CreateQuestion(ctx context.Context, q *domain.GameQuestion) error {
	optionsJSON, _ := json.Marshal(q.Options)
	query := `
		INSERT INTO game_questions (game_type, question, options, correct_answer, bible_ref, explanation, difficulty, active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query,
		q.GameType, q.Question, optionsJSON, q.CorrectAnswer, q.BibleRef, q.Explanation, q.Difficulty, q.Active,
	).Scan(&q.ID, &q.CreatedAt)
}

func (r *GameRepository) HasPlayedToday(ctx context.Context, userID string, gameType domain.GameType) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1 FROM game_attempts
			WHERE user_id = $1 AND game_type = $2
			  AND DATE(played_at AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC')
		)
	`
	var exists bool
	err := r.pool.QueryRow(ctx, query, userID, gameType).Scan(&exists)
	return exists, err
}

func (r *GameRepository) RecordAttempt(ctx context.Context, a *domain.GameAttempt) error {
	query := `
		INSERT INTO game_attempts (user_id, game_type, played_at, score, max_score, points_awarded, completed, time_spent_sec)
		VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)
		RETURNING id, played_at
	`
	return r.pool.QueryRow(ctx, query,
		a.UserID, a.GameType, a.Score, a.MaxScore, a.PointsAwarded, a.Completed, a.TimeSpentSec,
	).Scan(&a.ID, &a.PlayedAt)
}

func (r *GameRepository) ListUserAttempts(ctx context.Context, userID string, limit int) ([]*domain.GameAttempt, error) {
	query := `
		SELECT id, user_id, game_type, played_at, score, max_score, points_awarded, completed, time_spent_sec
		FROM game_attempts
		WHERE user_id = $1
		ORDER BY played_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []*domain.GameAttempt
	for rows.Next() {
		var a domain.GameAttempt
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.GameType, &a.PlayedAt, &a.Score, &a.MaxScore, &a.PointsAwarded, &a.Completed, &a.TimeSpentSec,
		); err != nil {
			return nil, err
		}
		attempts = append(attempts, &a)
	}
	return attempts, nil
}
