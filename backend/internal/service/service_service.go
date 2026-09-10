package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
)

type ServiceService struct {
	serviceRepo    *postgres.ServiceRepository
	attendanceRepo *postgres.AttendanceRepository
	pointsRepo     *postgres.PointsRepository
	userRepo       *postgres.UserRepository
}

func NewServiceService(
	serviceRepo *postgres.ServiceRepository,
	attendanceRepo *postgres.AttendanceRepository,
	pointsRepo *postgres.PointsRepository,
	userRepo *postgres.UserRepository,
) *ServiceService {
	return &ServiceService{
		serviceRepo:    serviceRepo,
		attendanceRepo: attendanceRepo,
		pointsRepo:     pointsRepo,
		userRepo:       userRepo,
	}
}

func (s *ServiceService) Create(ctx context.Context, title string, scheduledAt time.Time, location, description, feedback string) (*domain.Service, error) {
	qrToken := uuid.New().String()
	srv := &domain.Service{
		Title:          title,
		ScheduledAt:    scheduledAt,
		Status:         domain.ServiceUpcoming,
		Location:       location,
		Description:    description,
		FeedbackPrompt: feedback,
		QRToken:        qrToken,
	}
	if err := s.serviceRepo.Create(ctx, srv); err != nil {
		return nil, err
	}
	return srv, nil
}

func (s *ServiceService) List(ctx context.Context) ([]*domain.Service, error) {
	return s.serviceRepo.List(ctx)
}

func (s *ServiceService) GetUpcoming(ctx context.Context) (*domain.Service, error) {
	return s.serviceRepo.GetUpcoming(ctx)
}

type CheckInResult struct {
	Attendance   *domain.Attendance `json:"attendance"`
	PointsEarned int                `json:"points_earned"`
	IsEarly      bool               `json:"is_early"`
	Message      string             `json:"message"`
}

func (s *ServiceService) CheckIn(ctx context.Context, userID, serviceID, qrToken string) (*CheckInResult, error) {
	srv, err := s.serviceRepo.GetByID(ctx, serviceID)
	if err != nil {
		return nil, err
	}
	if srv == nil {
		return nil, errors.New("el servicio no existe")
	}

	// Validate QR Token
	if qrToken != "" && srv.QRToken != qrToken {
		return nil, errors.New("código QR inválido o expirado para este servicio")
	}

	// Check if already checked in
	existing, err := s.attendanceRepo.GetByServiceAndUser(ctx, serviceID, userID)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("ya tienes asistencia registrada para este servicio")
	}

	now := time.Now()
	// Is early if checked in before scheduled time or up to 10 minutes after
	isEarly := now.Before(srv.ScheduledAt.Add(10 * time.Minute))

	pointsToAward := 300
	reason := fmt.Sprintf("Asistencia a: %s", srv.Title)
	if isEarly {
		pointsToAward = 375 // 300 + 75 bono por llegar temprano
		reason = fmt.Sprintf("Asistencia puntual a: %s (+75 bono temprano)", srv.Title)
	}

	att := &domain.Attendance{
		ServiceID: serviceID,
		UserID:    userID,
		IsEarly:   isEarly,
		Notes:     "Check-in QR verificado",
	}

	if err := s.attendanceRepo.Record(ctx, att); err != nil {
		return nil, err
	}

	// Otorgar puntos al joven
	_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
		UserID:    userID,
		Points:    pointsToAward,
		Reason:    reason,
		Category:  domain.CategoryAttendance,
		ServiceID: &serviceID,
	})

	// Si fue invitado por un padrino/amigo, otorgar puntos al invitador (+100)
	u, _ := s.userRepo.GetByID(ctx, userID)
	if u != nil && u.InvitedByID != nil {
		_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
			UserID:    *u.InvitedByID,
			Points:    100,
			Reason:    fmt.Sprintf("Tu invitado %s asistió al servicio", u.FullName),
			Category:  domain.CategoryInvite,
			ServiceID: &serviceID,
		})
	}

	msg := "¡Asistencia registrada exitosamente! Ganaste +300 pts."
	if isEarly {
		msg = "¡Llegaste a tiempo! Ganaste +375 pts (incluye +75 bono puntualidad)."
	}

	return &CheckInResult{
		Attendance:   att,
		PointsEarned: pointsToAward,
		IsEarly:      isEarly,
		Message:      msg,
	}, nil
}

func (s *ServiceService) ListAttendanceByService(ctx context.Context, serviceID string) ([]*domain.Attendance, error) {
	return s.attendanceRepo.ListByService(ctx, serviceID)
}

func (s *ServiceService) DeleteAttendance(ctx context.Context, attendanceID string) error {
	return s.attendanceRepo.Delete(ctx, attendanceID)
}
