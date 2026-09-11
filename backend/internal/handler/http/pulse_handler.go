package http

import (
	"encoding/json"
	"net/http"

	"intimos/backend/internal/middleware"
	"intimos/backend/internal/service"
	"intimos/backend/pkg/response"
)

type PulseHandler struct {
	pulseService *service.PulseService
}

func NewPulseHandler(pulseService *service.PulseService) *PulseHandler {
	return &PulseHandler{pulseService: pulseService}
}

func (h *PulseHandler) GetToday(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	status, err := h.pulseService.GetTodayStatus(r.Context(), claims.UserID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, status)
}

func (h *PulseHandler) CompleteReflection(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	status, err := h.pulseService.CompleteReflection(r.Context(), claims.UserID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, status)
}

type TriviaRequest struct {
	Selected int  `json:"selected"`
	Correct  bool `json:"correct"`
}

func (h *PulseHandler) SubmitTrivia(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req TriviaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	status, err := h.pulseService.SubmitTrivia(r.Context(), claims.UserID, req.Selected, req.Correct)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, status)
}

type PrayerRequest struct {
	PrayerText string `json:"prayer_text"`
}

func (h *PulseHandler) RecordPrayer(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req PrayerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	status, err := h.pulseService.RecordPrayer(r.Context(), claims.UserID, req.PrayerText)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, status)
}
