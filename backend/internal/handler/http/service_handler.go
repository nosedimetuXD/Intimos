package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"intimos/backend/internal/domain"
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
	ServiceType    string    `json:"service_type"`
	Preacher       string    `json:"preacher"`
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

	srv, err := h.serviceService.Create(r.Context(), req.Title, req.ScheduledAt, req.Location, req.Description, req.FeedbackPrompt, req.ServiceType, req.Preacher)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, srv)
}

func (h *ServiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	srv, err := h.serviceService.GetByID(r.Context(), id)
	if err != nil || srv == nil {
		response.Error(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	response.JSON(w, http.StatusOK, srv)
}

type UpdateServiceRequest struct {
	Title          string              `json:"title"`
	ScheduledAt    time.Time           `json:"scheduled_at"`
	Status         domain.ServiceStatus `json:"status"`
	Location       string              `json:"location"`
	Description    string              `json:"description"`
	FeedbackPrompt string              `json:"feedback_prompt"`
	ServiceType    string              `json:"service_type"`
	Preacher       string              `json:"preacher"`
}

func (h *ServiceHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	srv, err := h.serviceService.GetByID(r.Context(), id)
	if err != nil || srv == nil {
		response.Error(w, http.StatusNotFound, "servicio no encontrado")
		return
	}

	srv.Title = req.Title
	srv.ScheduledAt = req.ScheduledAt
	srv.Status = req.Status
	srv.Location = req.Location
	srv.Description = req.Description
	srv.FeedbackPrompt = req.FeedbackPrompt
	srv.ServiceType = req.ServiceType
	srv.Preacher = req.Preacher

	if err := h.serviceService.Update(r.Context(), srv); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, srv)
}

func (h *ServiceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.serviceService.Delete(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "servicio eliminado exitosamente")
}

type CheckInRequest struct {
	QRToken string `json:"qr_token"`
	UserID  string `json:"user_id"`
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

	targetUserID := claims.UserID
	if req.UserID != "" && claims.Role != "member" {
		targetUserID = req.UserID
	}

	result, err := h.serviceService.CheckIn(r.Context(), targetUserID, serviceID, req.QRToken)
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
