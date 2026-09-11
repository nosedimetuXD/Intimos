package http

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/middleware"
)

type RouterConfig struct {
	AuthHandler    *AuthHandler
	ServiceHandler *ServiceHandler
	PointsHandler  *PointsHandler
	GameHandler    *GameHandler
	CentralHandler *CentralHandler
	PulseHandler   *PulseHandler
	BadgeHandler   *BadgeHandler
	JWTSecret      string
	CORSOrigins    string
}

func NewRouter(cfg RouterConfig) *chi.Mux {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.NewCORSMiddleware(cfg.CORSOrigins))

	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)

	// Healthcheck
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"healthy","project":"intimos-backend"}`))
	})

	r.Route("/api", func(api chi.Router) {
		// Public Auth
		api.Post("/auth/login", cfg.AuthHandler.Login)
		api.Post("/auth/register", cfg.AuthHandler.Register)

		// Public Services & Rankings
		api.Get("/services/upcoming", cfg.ServiceHandler.GetUpcoming)
		api.Get("/points/ranking", cfg.PointsHandler.GetRanking)
		api.Get("/announcements", cfg.CentralHandler.ListAnnouncements)

		// Authenticated Routes
		api.Group(func(auth chi.Router) {
			auth.Use(authMiddleware)

			// Current User
			auth.Get("/auth/me", cfg.AuthHandler.GetMe)
			auth.Get("/points/history", cfg.PointsHandler.GetHistory)

			// Services & Attendance
			auth.Get("/services", cfg.ServiceHandler.List)
			auth.Post("/services/{id}/checkin", cfg.ServiceHandler.CheckIn)

			// Games
			auth.Get("/games/{type}/questions", cfg.GameHandler.GetQuestions)
			auth.Post("/games/{type}/submit", cfg.GameHandler.SubmitGame)

			// Pulso Diario
			auth.Get("/pulse/today", cfg.PulseHandler.GetToday)
			auth.Post("/pulse/reflection", cfg.PulseHandler.CompleteReflection)
			auth.Post("/pulse/trivia", cfg.PulseHandler.SubmitTrivia)
			auth.Post("/pulse/prayer", cfg.PulseHandler.RecordPrayer)

			// Badges / Logros
			auth.Get("/badges/my-progress", cfg.BadgeHandler.GetMyProgress)

			// Team Routes (/central)
			auth.Group(func(team chi.Router) {
				team.Use(middleware.RequireRoles(domain.RoleApoyo, domain.RoleApoyo2, domain.RolePastoral))

				team.Post("/services", cfg.ServiceHandler.Create)
				team.Get("/services/{id}/attendance", cfg.ServiceHandler.ListAttendance)
				team.Delete("/services/attendance/{attendanceId}", cfg.ServiceHandler.DeleteAttendance)
				team.Post("/points/adjust", cfg.PointsHandler.AdjustPoints)
				team.Post("/announcements", cfg.CentralHandler.CreateAnnouncement)
			})

			// User Management (Apoyo2, Pastoral, Superadmin)
			auth.Group(func(userMgr chi.Router) {
				userMgr.Use(middleware.RequireRoles(domain.RoleApoyo2, domain.RolePastoral))
				userMgr.Get("/central/users", cfg.CentralHandler.ListUsers)
				userMgr.Put("/central/users/{id}", cfg.CentralHandler.UpdateUser)
			})

			// Pastoral & Superadmin Routes (Finances & Camp)
			auth.Group(func(pastoral chi.Router) {
				pastoral.Use(middleware.RequireRoles(domain.RolePastoral))
				pastoral.Get("/central/camp-payments", cfg.CentralHandler.ListCampPayments)
				pastoral.Post("/central/camp-payments", cfg.CentralHandler.RecordCampPayment)
				pastoral.Get("/central/finances", cfg.CentralHandler.ListFinances)
				pastoral.Post("/central/finances", cfg.CentralHandler.RecordFinance)
			})
		})
	})

	return r
}
