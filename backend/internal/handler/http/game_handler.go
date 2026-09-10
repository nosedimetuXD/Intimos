package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/middleware"
	"intimos/backend/internal/service"
	"intimos/backend/pkg/response"
)

type GameHandler struct {
	gameService *service.GameService
}

func NewGameHandler(gameService *service.GameService) *GameHandler {
	return &GameHandler{gameService: gameService}
}

func (h *GameHandler) GetQuestions(w http.ResponseWriter, r *http.Request) {
	gameTypeStr := chi.URLParam(r, "type")
	gameType := domain.GameType(gameTypeStr)

	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	questions, alreadyPlayed, err := h.gameService.GetDailyQuestions(r.Context(), claims.UserID, gameType, 10)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if alreadyPlayed {
		response.JSON(w, http.StatusOK, map[string]interface{}{
			"already_played": true,
			"questions":      []interface{}{},
			"message":        "Ya jugaste tu reto diario para este juego.",
		})
		return
	}

	response.JSON(w, http.StatusOK, map[string]interface{}{
		"already_played": false,
		"questions":      questions,
	})
}

func (h *GameHandler) SubmitGame(w http.ResponseWriter, r *http.Request) {
	gameTypeStr := chi.URLParam(r, "type")
	gameType := domain.GameType(gameTypeStr)

	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req service.SubmitGameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	result, err := h.gameService.SubmitGame(r.Context(), claims.UserID, gameType, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, result)
}
