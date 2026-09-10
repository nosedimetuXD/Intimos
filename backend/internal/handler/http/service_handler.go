package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"intimos/backend/internal/middleware"
	"intimos/backend/internal/service"
	"intimos/backend/pkg/response"
)

type ServiceHandler struct {
	serviceService *service.ServiceService
}

func NewServiceHandler(serviceService *service.ServiceService) *ServiceHandler {
	return &ServiceHandler{serviceService: serviceService}
}

func (h *ServiceHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.serviceService.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *ServiceHandler) GetUpcoming(w http.ResponseWriter, r *http.Request) {
	srv, err := h.serviceService.GetUpcoming(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, srv)
}

type CreateServiceRequest struct {
	Title          string    `json:"title"`
	ScheduledAt    time.Time `json:"scheduled_at"`
	Location       string    `json:"location"`
	Description    string    `json:"description"`
	FeedbackPrompt string    `json:"feedback_prompt"`
}

func (h *ServiceHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	if req.Title == "" {
		response.Error(w, http.StatusBadRequest, "el título del servicio es requerido")
		return
	}

	srv, err := h.serviceService.Create(r.Context(), req.Title, req.ScheduledAt, req.Location, req.Description, req.FeedbackPrompt)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, srv)
}

type CheckInRequest struct {
	QRToken string `json:"qr_token"`
}

func (h *ServiceHandler) CheckIn(w http.ResponseWriter, r *http.Request) {
	serviceID := chi.URLParam(r, "id")
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req CheckInRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	result, err := h.serviceService.CheckIn(r.Context(), claims.UserID, serviceID, req.QRToken)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, result)
}

func (h *ServiceHandler) ListAttendance(w http.ResponseWriter, r *http.Request) {
	serviceID := chi.URLParam(r, "id")
	list, err := h.serviceService.ListAttendanceByService(r.Context(), serviceID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *ServiceHandler) DeleteAttendance(w http.ResponseWriter, r *http.Request) {
	attendanceID := chi.URLParam(r, "attendanceId")
	if err := h.serviceService.DeleteAttendance(r.Context(), attendanceID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "asistencia eliminada exitosamente")
}
