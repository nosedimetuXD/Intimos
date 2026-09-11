package service

import (
	"context"
	"errors"
	"fmt"

	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
)

type GameService struct {
	gameRepo      *postgres.GameRepository
	pointsService *PointsService
}

func NewGameService(gameRepo *postgres.GameRepository, pointsService *PointsService) *GameService {
	return &GameService{
		gameRepo:      gameRepo,
		pointsService: pointsService,
	}
}

// ClientQuestion omits correct_answer to prevent client-side inspection!
type ClientQuestion struct {
	ID          string   `json:"id"`
	GameType    string   `json:"game_type"`
	Question    string   `json:"question"`
	Options     []string `json:"options"`
	BibleRef    string   `json:"bible_ref"`
	Difficulty  int      `json:"difficulty"`
}

func (s *GameService) GetDailyQuestions(ctx context.Context, userID string, gameType domain.GameType, limit int) ([]*ClientQuestion, bool, error) {
	hasPlayed, err := s.gameRepo.HasPlayedToday(ctx, userID, gameType)
	if err != nil {
		return nil, false, err
	}
	if hasPlayed {
		return nil, true, nil
	}

	if limit <= 0 {
		limit = 10
	}

	questions, err := s.gameRepo.GetQuestions(ctx, gameType, limit)
	if err != nil {
		return nil, false, err
	}

	var clientQuestions []*ClientQuestion
	for _, q := range questions {
		clientQuestions = append(clientQuestions, &ClientQuestion{
			ID:         q.ID,
			GameType:   string(q.GameType),
			Question:   q.Question,
			Options:    q.Options,
			BibleRef:   q.BibleRef,
			Difficulty: q.Difficulty,
		})
	}

	return clientQuestions, false, nil
}

type SubmitGameRequest struct {
	Score        int `json:"score"`
	MaxScore     int `json:"max_score"`
	TimeSpentSec int `json:"time_spent_sec"`
}

type SubmitGameResult struct {
	Attempt       *domain.GameAttempt `json:"attempt"`
	PointsAwarded int                 `json:"points_awarded"`
	Capped        bool                `json:"capped"`
	Message       string              `json:"message"`
}

func (s *GameService) SubmitGame(ctx context.Context, userID string, gameType domain.GameType, req SubmitGameRequest) (*SubmitGameResult, error) {
	hasPlayed, err := s.gameRepo.HasPlayedToday(ctx, userID, gameType)
	if err != nil {
		return nil, err
	}
	if hasPlayed {
		return nil, errors.New("ya completaste tu intento diario para este juego")
	}

	// Calculate base points: e.g. 10 points per correct answer up to max 100 per game
	earnedPoints := req.Score * 10
	if earnedPoints < 0 {
		earnedPoints = 0
	}
	if earnedPoints > 100 {
		earnedPoints = 100
	}

	gameTitle := string(gameType)
	switch gameType {
	case domain.GameVersoFlash:
		gameTitle = "Verso Flash"
	case domain.GameQueHarias:
		gameTitle = "¿Qué Harías?"
	case domain.GameReto60:
		gameTitle = "Reto 60"
	case domain.GameVerdaderoFalso:
		gameTitle = "Verdadero o Falso"
	case domain.GameAhorcado:
		gameTitle = "Ahorcado Bíblico"
	case domain.GameOrdenaVerso:
		gameTitle = "Ordena el Versículo"
	}

	reason := fmt.Sprintf("Reto diario: %s (Puntaje: %d/%d)", gameTitle, req.Score, req.MaxScore)
	res, err := s.pointsService.AwardPoints(ctx, userID, earnedPoints, reason, domain.CategoryGame, nil, nil)
	if err != nil {
		return nil, err
	}

	attempt := &domain.GameAttempt{
		UserID:        userID,
		GameType:      gameType,
		Score:         req.Score,
		MaxScore:      req.MaxScore,
		PointsAwarded: res.AppliedPoints,
		Completed:     true,
		TimeSpentSec:  req.TimeSpentSec,
	}

	if err := s.gameRepo.RecordAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	msg := fmt.Sprintf("¡Juego completado! Ganaste +%d pts.", res.AppliedPoints)
	if res.Capped {
		msg += " (Alcanzaste el límite de puntos de juegos)."
	}

	return &SubmitGameResult{
		Attempt:       attempt,
		PointsAwarded: res.AppliedPoints,
		Capped:        res.Capped,
		Message:       msg,
	}, nil
}
