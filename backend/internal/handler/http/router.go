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

		// Public Services & Rankings & Community
		api.Get("/services/upcoming", cfg.ServiceHandler.GetUpcoming)
		api.Get("/points/ranking", cfg.PointsHandler.GetRanking)
		api.Get("/announcements", cfg.CentralHandler.ListAnnouncements)
		api.Get("/playlists", cfg.CentralHandler.ListPlaylists)
		api.Get("/reflections/public", cfg.CentralHandler.ListPublicReflections)
		api.Get("/challenges/weekly", cfg.CentralHandler.GetActiveWeeklyChallenge)
		api.Get("/users/birthdays", cfg.CentralHandler.GetBirthdays)

		// Authenticated Routes
		api.Group(func(auth chi.Router) {
			auth.Use(authMiddleware)

			// Current User & Profile
			auth.Get("/auth/me", cfg.AuthHandler.GetMe)
			auth.Put("/users/me", cfg.CentralHandler.UpdateMyProfile)
			auth.Post("/users/prayer-partner", cfg.CentralHandler.SetPrayerPartner)
			auth.Get("/points/history", cfg.PointsHandler.GetHistory)

			// Services & Attendance
			auth.Get("/services", cfg.ServiceHandler.List)
			auth.Get("/services/{id}", cfg.ServiceHandler.GetByID)
			auth.Post("/services/{id}/checkin", cfg.ServiceHandler.CheckIn)

			// Suggestions (Mi Voz)
			auth.Get("/suggestions/my", cfg.CentralHandler.ListMySuggestions)
			auth.Post("/suggestions", cfg.CentralHandler.CreateSuggestion)

			// Weekly Challenge Completion
			auth.Post("/challenges/weekly/{id}/complete", cfg.CentralHandler.CompleteWeeklyChallenge)

			// Reflections
			auth.Post("/reflections", cfg.CentralHandler.CreateReflection)

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

			// Team Routes (/central - Apoyo, Apoyo2, Pastoral, Superadmin)
			auth.Group(func(team chi.Router) {
				team.Use(middleware.RequireRoles(domain.RoleApoyo, domain.RoleApoyo2, domain.RolePastoral))

				// Services CRUD
				team.Post("/services", cfg.ServiceHandler.Create)
				team.Put("/services/{id}", cfg.ServiceHandler.Update)
				team.Delete("/services/{id}", cfg.ServiceHandler.Delete)
				team.Get("/services/{id}/attendance", cfg.ServiceHandler.ListAttendance)
				team.Delete("/services/attendance/{attendanceId}", cfg.ServiceHandler.DeleteAttendance)

				// Points adjustment
				team.Post("/points/adjust", cfg.PointsHandler.AdjustPoints)

				// Announcements
				team.Get("/central/announcements", cfg.CentralHandler.ListAllAnnouncements)
				team.Post("/announcements", cfg.CentralHandler.CreateAnnouncement)
				team.Put("/announcements/{id}", cfg.CentralHandler.UpdateAnnouncement)
				team.Delete("/announcements/{id}", cfg.CentralHandler.DeleteAnnouncement)

				// Suggestions moderation
				team.Get("/central/suggestions", cfg.CentralHandler.ListAllSuggestions)
				team.Put("/central/suggestions/{id}", cfg.CentralHandler.UpdateSuggestionStatus)

				// Ideas Bank
				team.Get("/ideas", cfg.CentralHandler.ListIdeas)
				team.Post("/ideas", cfg.CentralHandler.CreateIdea)
				team.Put("/ideas/{id}", cfg.CentralHandler.UpdateIdea)
				team.Delete("/ideas/{id}", cfg.CentralHandler.DeleteIdea)

				// Weekly challenges management
				team.Get("/challenges/weekly/all", cfg.CentralHandler.ListWeeklyChallenges)
				team.Post("/challenges/weekly", cfg.CentralHandler.CreateWeeklyChallenge)
				team.Put("/challenges/weekly/{id}/toggle", cfg.CentralHandler.ToggleWeeklyChallenge)

				// Directory with details & notes
				team.Get("/central/directory", cfg.CentralHandler.GetDirectory)
				team.Put("/central/users/{id}/notes", cfg.CentralHandler.UpdateUserNotes)

				// Central Dashboard Stats & Camp Summary
				team.Get("/central/stats", cfg.CentralHandler.GetCentralStats)
				team.Get("/central/camp-summary", cfg.CentralHandler.GetCampSummary)
				team.Delete("/central/camp-payments/{id}", cfg.CentralHandler.DeleteCampPayment)
				team.Get("/central/analytics/games", cfg.CentralHandler.GetGameAnalytics)
			})

			// User Management (Apoyo2, Pastoral, Superadmin)
			auth.Group(func(userMgr chi.Router) {
				userMgr.Use(middleware.RequireRoles(domain.RoleApoyo2, domain.RolePastoral))
				userMgr.Get("/central/users", cfg.CentralHandler.ListUsers)
				userMgr.Post("/central/users", cfg.CentralHandler.CreateUser)
				userMgr.Put("/central/users/{id}", cfg.CentralHandler.UpdateUser)
				userMgr.Delete("/central/users/{id}", cfg.CentralHandler.DeleteUser)
				userMgr.Get("/central/users/export", cfg.CentralHandler.ExportUsersCSV)
			})

			// Pastoral & Superadmin Routes (Finances, Reflections Moderation, Playlists)
			auth.Group(func(pastoral chi.Router) {
				pastoral.Use(middleware.RequireRoles(domain.RolePastoral))
				pastoral.Get("/central/camp-payments", cfg.CentralHandler.ListCampPayments)
				pastoral.Post("/central/camp-payments", cfg.CentralHandler.RecordCampPayment)
				pastoral.Get("/central/finances", cfg.CentralHandler.ListFinances)
				pastoral.Post("/central/finances", cfg.CentralHandler.RecordFinance)
				pastoral.Delete("/central/finances/{id}", cfg.CentralHandler.DeleteFinance)
				pastoral.Get("/central/reflections", cfg.CentralHandler.ListAllReflections)
				pastoral.Put("/central/reflections/{id}/moderate", cfg.CentralHandler.ModerateReflection)
				pastoral.Post("/central/playlists", cfg.CentralHandler.CreatePlaylist)
				pastoral.Delete("/central/playlists/{id}", cfg.CentralHandler.DeletePlaylist)
			})

			// Superadmin Only Routes (Groups, Feature Flags, Points Config, QR)
			auth.Group(func(superAdmin chi.Router) {
				superAdmin.Use(middleware.RequireRoles(domain.RoleSuperAdmin))

				// Groups / Células
				superAdmin.Get("/central/groups", cfg.CentralHandler.ListGroups)
				superAdmin.Post("/central/groups", cfg.CentralHandler.CreateGroup)
				superAdmin.Put("/central/groups/{id}", cfg.CentralHandler.UpdateGroup)
				superAdmin.Delete("/central/groups/{id}", cfg.CentralHandler.DeleteGroup)
				superAdmin.Post("/central/groups/{id}/members", cfg.CentralHandler.AddGroupMember)
				superAdmin.Delete("/central/groups/{id}/members/{userId}", cfg.CentralHandler.RemoveGroupMember)

				// Feature Flags
				superAdmin.Get("/central/feature-flags", cfg.CentralHandler.ListFeatureFlags)
				superAdmin.Put("/central/feature-flags", cfg.CentralHandler.SaveFeatureFlag)

				// Points config & QR Settings
				superAdmin.Get("/central/points-config", cfg.CentralHandler.GetPointsConfig)
				superAdmin.Put("/central/points-config", cfg.CentralHandler.SavePointsConfig)
				superAdmin.Get("/central/qr-settings", cfg.CentralHandler.GetQRSettings)
				superAdmin.Put("/central/qr-settings", cfg.CentralHandler.SaveQRSettings)
			})
		})
	})

	return r
}
