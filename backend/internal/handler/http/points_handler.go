package http

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"intimos/backend/internal/middleware"
	"intimos/backend/internal/service"
	"intimos/backend/pkg/response"
)

type PointsHandler struct {
	pointsService *service.PointsService
}

func NewPointsHandler(pointsService *service.PointsService) *PointsHandler {
	return &PointsHandler{pointsService: pointsService}
}

func (h *PointsHandler) GetRanking(w http.ResponseWriter, r *http.Request) {
	yearStr := r.URL.Query().Get("year")
	monthStr := r.URL.Query().Get("month")

	year, _ := strconv.Atoi(yearStr)
	monthInt, _ := strconv.Atoi(monthStr)

	ranking, err := h.pointsService.GetMonthlyRanking(r.Context(), year, time.Month(monthInt))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, ranking)
}

func (h *PointsHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit, _ := strconv.Atoi(limitStr)

	history, err := h.pointsService.GetUserHistory(r.Context(), claims.UserID, limit)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, history)
}

type AdjustPointsRequest struct {
	TargetUserID string `json:"target_user_id"`
	Points       int    `json:"points"`
	Reason       string `json:"reason"`
}

func (h *PointsHandler) AdjustPoints(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req AdjustPointsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	res, err := h.pointsService.ManualAdjustment(r.Context(), claims.UserID, req.TargetUserID, req.Points, req.Reason)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, res)
}
