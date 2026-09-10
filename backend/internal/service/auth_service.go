package service

import (
	"context"
	"errors"
	"time"

	"intimos/backend/internal/domain"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/pkg/hasher"
	"intimos/backend/pkg/token"
)

type AuthService struct {
	userRepo   *postgres.UserRepository
	pointsRepo *postgres.PointsRepository
	jwtSecret  string
}

func NewAuthService(userRepo *postgres.UserRepository, pointsRepo *postgres.PointsRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		pointsRepo: pointsRepo,
		jwtSecret:  jwtSecret,
	}
}

type AuthResponse struct {
	Token       string       `json:"token"`
	User        *domain.User `json:"user"`
	TotalPoints int          `json:"total_points"`
	MonthPoints int          `json:"month_points"`
	Level       string       `json:"level"`
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*AuthResponse, error) {
	u, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if u == nil || !u.Active {
		return nil, errors.New("credenciales inválidas o usuario inactivo")
	}

	if !hasher.CheckPassword(password, u.PasswordHash) {
		return nil, errors.New("credenciales inválidas")
	}

	t, err := token.GenerateToken(u.ID, u.Email, string(u.Role), s.jwtSecret, 30*24*time.Hour)
	if err != nil {
		return nil, err
	}

	totalPts, monthPts, _ := s.pointsRepo.GetUserPointsSummary(ctx, u.ID)

	return &AuthResponse{
		Token:       t,
		User:        u,
		TotalPoints: totalPts,
		MonthPoints: monthPts,
		Level:       postgres.CalculateLevel(totalPts),
	}, nil
}

func (s *AuthService) Register(ctx context.Context, email, password, fullName, phone string, invitedByID *string) (*AuthResponse, error) {
	existing, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, errors.New("ya existe una cuenta registrada con este correo electrónico")
	}

	hashed, err := hasher.HashPassword(password)
	if err != nil {
		return nil, err
	}

	u := &domain.User{
		Email:        email,
		PasswordHash: hashed,
		FullName:     fullName,
		Phone:        phone,
		InvitedByID:  invitedByID,
		Role:         domain.RoleMiembro,
		Active:       true,
	}

	if err := s.userRepo.Create(ctx, u); err != nil {
		return nil, err
	}

	// Otorgar puntos de bienvenida (+50)
	_ = s.pointsRepo.Add(ctx, &domain.PointsLedger{
		UserID:   u.ID,
		Points:   50,
		Reason:   "¡Bienvenido a Íntimos!",
		Category: domain.CategoryBonus,
	})

	t, err := token.GenerateToken(u.ID, u.Email, string(u.Role), s.jwtSecret, 30*24*time.Hour)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token:       t,
		User:        u,
		TotalPoints: 50,
		MonthPoints: 50,
		Level:       postgres.CalculateLevel(50),
	}, nil
}

func (s *AuthService) GetProfile(ctx context.Context, userID string) (*AuthResponse, error) {
	u, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, errors.New("usuario no encontrado")
	}

	totalPts, monthPts, _ := s.pointsRepo.GetUserPointsSummary(ctx, u.ID)

	return &AuthResponse{
		User:        u,
		TotalPoints: totalPts,
		MonthPoints: monthPts,
		Level:       postgres.CalculateLevel(totalPts),
	}, nil
}
