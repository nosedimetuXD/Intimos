package service

import (
	"context"
	"errors"
	"time"

	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
)

type PointsService struct {
	pointsRepo *postgres.PointsRepository
}

func NewPointsService(pointsRepo *postgres.PointsRepository) *PointsService {
	return &PointsService{pointsRepo: pointsRepo}
}

type AddPointsResult struct {
	RequestedPoints int  `json:"requested_points"`
	AppliedPoints   int  `json:"applied_points"`
	Capped          bool `json:"capped"`
}

func (s *PointsService) AwardPoints(ctx context.Context, userID string, points int, reason string, category domain.PointsCategory, grantedBy, serviceID *string) (*AddPointsResult, error) {
	if points == 0 {
		return &AddPointsResult{RequestedPoints: 0, AppliedPoints: 0, Capped: false}, nil
	}

	applied := points
	capped := false

	// If category is game, apply daily (200) and monthly (2500) caps
	if category == domain.CategoryGame && points > 0 {
		now := time.Now()
		dailyEarned, err := s.pointsRepo.GetDailyGamePoints(ctx, userID, now)
		if err != nil {
			return nil, err
		}

		const maxDaily = 200
		if dailyEarned >= maxDaily {
			return &AddPointsResult{RequestedPoints: points, AppliedPoints: 0, Capped: true}, nil
		}

		if dailyEarned+applied > maxDaily {
			applied = maxDaily - dailyEarned
			capped = true
		}

		// Also check monthly cap (2500)
		monthlyEarned, err := s.pointsRepo.GetMonthlyGamePoints(ctx, userID, now.Year(), now.Month())
		if err != nil {
			return nil, err
		}

		const maxMonthly = 2500
		if monthlyEarned >= maxMonthly {
			return &AddPointsResult{RequestedPoints: points, AppliedPoints: 0, Capped: true}, nil
		}

		if monthlyEarned+applied > maxMonthly {
			applied = maxMonthly - monthlyEarned
			capped = true
		}
	}

	ledger := &domain.PointsLedger{
		UserID:    userID,
		Points:    applied,
		Reason:    reason,
		Category:  category,
		GrantedBy: grantedBy,
		ServiceID: serviceID,
	}

	if err := s.pointsRepo.Add(ctx, ledger); err != nil {
		return nil, err
	}

	return &AddPointsResult{
		RequestedPoints: points,
		AppliedPoints:   applied,
		Capped:          capped,
	}, nil
}

func (s *PointsService) GetMonthlyRanking(ctx context.Context, year int, month time.Month) ([]*domain.UserRanking, error) {
	if year == 0 {
		year = time.Now().Year()
	}
	if month == 0 {
		month = time.Now().Month()
	}
	return s.pointsRepo.GetMonthlyRanking(ctx, year, month)
}

func (s *PointsService) GetUserHistory(ctx context.Context, userID string, limit int) ([]*domain.PointsLedger, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	return s.pointsRepo.GetHistory(ctx, userID, limit)
}

func (s *PointsService) ManualAdjustment(ctx context.Context, adminID, targetUserID string, points int, reason string) (*AddPointsResult, error) {
	if reason == "" {
		return nil, errors.New("el motivo del ajuste de puntos es obligatorio")
	}
	return s.AwardPoints(ctx, targetUserID, points, reason, domain.CategoryManual, &adminID, nil)
}
