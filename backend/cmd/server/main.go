package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"intimos/backend/internal/config"
	"intimos/backend/internal/database"
	httphandler "intimos/backend/internal/handler/http"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/internal/service"
)

func main() {
	log.Println("🚀 Starting Íntimos Backend Service...")

	cfg := config.Load()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize Database Pool
	pool, err := database.NewPostgresPool(ctx, cfg.DBURL)
	if err != nil {
		log.Fatalf("❌ Database connection error: %v", err)
	}
	defer pool.Close()

	// Auto-run migrations
	if err := database.Migrate(ctx, pool); err != nil {
		log.Fatalf("❌ Migration error: %v", err)
	}

	// Repositories
	userRepo := postgres.NewUserRepository(pool)
	serviceRepo := postgres.NewServiceRepository(pool)
	attendanceRepo := postgres.NewAttendanceRepository(pool)
	pointsRepo := postgres.NewPointsRepository(pool)
	gameRepo := postgres.NewGameRepository(pool)
	centralRepo := postgres.NewCentralRepository(pool)
	pulseRepo := postgres.NewPulseRepository(pool)
	badgeRepo := postgres.NewBadgeRepository(pool)

	// Services
	authService := service.NewAuthService(userRepo, pointsRepo, cfg.JWTSecret)
	serviceService := service.NewServiceService(serviceRepo, attendanceRepo, pointsRepo, userRepo)
	pointsService := service.NewPointsService(pointsRepo)
	gameService := service.NewGameService(gameRepo, pointsService)
	pulseService := service.NewPulseService(pulseRepo, pointsRepo, pointsService)
	badgeService := service.NewBadgeService(badgeRepo)

	// Pre-seed badges catalog
	_ = badgeService.SeedBadges(ctx)

	// Handlers
	authHandler := httphandler.NewAuthHandler(authService)
	serviceHandler := httphandler.NewServiceHandler(serviceService)
	pointsHandler := httphandler.NewPointsHandler(pointsService)
	gameHandler := httphandler.NewGameHandler(gameService)
	centralHandler := httphandler.NewCentralHandler(userRepo, centralRepo, pointsRepo)
	pulseHandler := httphandler.NewPulseHandler(pulseService)
	badgeHandler := httphandler.NewBadgeHandler(badgeService)

	router := httphandler.NewRouter(httphandler.RouterConfig{
		AuthHandler:    authHandler,
		ServiceHandler: serviceHandler,
		PointsHandler:  pointsHandler,
		GameHandler:    gameHandler,
		CentralHandler: centralHandler,
		PulseHandler:   pulseHandler,
		BadgeHandler:   badgeHandler,
		JWTSecret:      cfg.JWTSecret,
		CORSOrigins:    cfg.CORSOrigins,
	})

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🌐 Server listening on http://0.0.0.0:%s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server listen error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}

	log.Println("👋 Server stopped.")
}
