package service

import (
	"context"
	"time"

	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
)

type PulseService struct {
	pulseRepo     *postgres.PulseRepository
	pointsRepo    *postgres.PointsRepository
	pointsService *PointsService
}

func NewPulseService(
	pulseRepo *postgres.PulseRepository,
	pointsRepo *postgres.PointsRepository,
	pointsService *PointsService,
) *PulseService {
	return &PulseService{
		pulseRepo:     pulseRepo,
		pointsRepo:    pointsRepo,
		pointsService: pointsService,
	}
}

func (s *PulseService) GetTodayStatus(ctx context.Context, userID string) (*domain.DailyPulseStatus, error) {
	pulse, err := s.pulseRepo.GetTodayPulse(ctx, userID)
	if err != nil {
		return nil, err
	}

	streak, _ := s.pulseRepo.GetActiveStreak(ctx, userID)

	if pulse == nil {
		pulse = &domain.DailyPulse{
			UserID:         userID,
			PulseDate:      time.Now(),
			ReflectionDone: false,
			TriviaDone:     false,
			TriviaCorrect:  false,
			PrayerDone:     false,
			PointsAwarded:  0,
		}
	}

	completedCount := 0
	if pulse.ReflectionDone {
		completedCount++
	}
	if pulse.TriviaDone && pulse.TriviaCorrect {
		completedCount++
	}
	if pulse.PrayerDone {
		completedCount++
	}

	// At least today has activity, streak is at least 1
	if completedCount > 0 && streak == 0 {
		streak = 1
	}

	return &domain.DailyPulseStatus{
		Pulse:          pulse,
		Streak:         streak,
		CompletedCount: completedCount,
		PointsToday:    pulse.PointsAwarded,
	}, nil
}

func (s *PulseService) CompleteReflection(ctx context.Context, userID string) (*domain.DailyPulseStatus, error) {
	status, err := s.GetTodayStatus(ctx, userID)
	if err != nil {
		return nil, err
	}

	p := status.Pulse
	if !p.ReflectionDone {
		p.ReflectionDone = true
		pts := 5
		p.PointsAwarded += pts

		_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
			UserID:   userID,
			Points:   pts,
			Reason:   "Pulso Diario: Reflexión del versículo",
			Category: domain.CategoryPulse,
		})

		if err := s.pulseRepo.UpsertPulse(ctx, p); err != nil {
			return nil, err
		}
	}

	return s.GetTodayStatus(ctx, userID)
}

func (s *PulseService) SubmitTrivia(ctx context.Context, userID string, selected int, isCorrect bool) (*domain.DailyPulseStatus, error) {
	status, err := s.GetTodayStatus(ctx, userID)
	if err != nil {
		return nil, err
	}

	p := status.Pulse
	if !p.TriviaDone {
		p.TriviaDone = true
		p.TriviaCorrect = isCorrect
		p.TriviaSelected = &selected

		pts := 0
		if isCorrect {
			pts = 10
			p.PointsAwarded += pts
			_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
				UserID:   userID,
				Points:   pts,
				Reason:   "Pulso Diario: Trivia Bíblica acertada",
				Category: domain.CategoryPulse,
			})
		}

		if err := s.pulseRepo.UpsertPulse(ctx, p); err != nil {
			return nil, err
		}
	}

	return s.GetTodayStatus(ctx, userID)
}

func (s *PulseService) RecordPrayer(ctx context.Context, userID string, prayerText string) (*domain.DailyPulseStatus, error) {
	status, err := s.GetTodayStatus(ctx, userID)
	if err != nil {
		return nil, err
	}

	p := status.Pulse
	if !p.PrayerDone {
		p.PrayerDone = true
		p.PrayerText = prayerText
		pts := 5
		p.PointsAwarded += pts

		_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
			UserID:   userID,
			Points:   pts,
			Reason:   "Pulso Diario: Oración personal consagrada",
			Category: domain.CategoryPulse,
		})

		if err := s.pulseRepo.UpsertPulse(ctx, p); err != nil {
			return nil, err
		}
	}

	return s.GetTodayStatus(ctx, userID)
}
