package http

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/middleware"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/pkg/response"
)

type CentralHandler struct {
	userRepo    *postgres.UserRepository
	centralRepo *postgres.CentralRepository
}

func NewCentralHandler(userRepo *postgres.UserRepository, centralRepo *postgres.CentralRepository) *CentralHandler {
	return &CentralHandler{
		userRepo:    userRepo,
		centralRepo: centralRepo,
	}
}

// Users management
func (h *CentralHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, users)
}

type UpdateUserRequest struct {
	FullName string      `json:"full_name"`
	Phone    string      `json:"phone"`
	Role     domain.Role `json:"role"`
	Active   bool        `json:"active"`
	Notes    string      `json:"notes"`
}

func (h *CentralHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	u, err := h.userRepo.GetByID(r.Context(), userID)
	if err != nil || u == nil {
		response.Error(w, http.StatusNotFound, "usuario no encontrado")
		return
	}

	u.FullName = req.FullName
	u.Phone = req.Phone
	u.Role = req.Role
	u.Active = req.Active
	u.Notes = req.Notes

	if err := h.userRepo.Update(r.Context(), u); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, u)
}

// Camp payments
func (h *CentralHandler) ListCampPayments(w http.ResponseWriter, r *http.Request) {
	payments, err := h.centralRepo.ListCampPayments(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, payments)
}

type RecordCampPaymentRequest struct {
	UserID      string    `json:"user_id"`
	Amount      float64   `json:"amount"`
	PaymentDate time.Time `json:"payment_date"`
	Method      string    `json:"method"`
	Notes       string    `json:"notes"`
}

func (h *CentralHandler) RecordCampPayment(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	var req RecordCampPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	p := &domain.CampPayment{
		UserID:       req.UserID,
		Amount:       req.Amount,
		PaymentDate:  req.PaymentDate,
		Method:       req.Method,
		Notes:        req.Notes,
		RegisteredBy: claims.UserID,
	}

	if err := h.centralRepo.RecordCampPayment(r.Context(), p); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, p)
}

// Finances
func (h *CentralHandler) ListFinances(w http.ResponseWriter, r *http.Request) {
	finances, err := h.centralRepo.ListFinances(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, finances)
}

type RecordFinanceRequest struct {
	Type            domain.FinanceType `json:"type"`
	Amount          float64            `json:"amount"`
	Category        string             `json:"category"`
	Description     string             `json:"description"`
	TransactionDate time.Time          `json:"transaction_date"`
}

func (h *CentralHandler) RecordFinance(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	var req RecordFinanceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	f := &domain.FinanceRecord{
		Type:            req.Type,
		Amount:          req.Amount,
		Category:        req.Category,
		Description:     req.Description,
		TransactionDate: req.TransactionDate,
		RegisteredBy:    claims.UserID,
	}

	if err := h.centralRepo.RecordFinance(r.Context(), f); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, f)
}

// Announcements
func (h *CentralHandler) ListAnnouncements(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListActiveAnnouncements(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreateAnnouncementRequest struct {
	Title    string `json:"title"`
	Content  string `json:"content"`
	Priority string `json:"priority"`
}

func (h *CentralHandler) CreateAnnouncement(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	var req CreateAnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	a := &domain.Announcement{
		Title:     req.Title,
		Content:   req.Content,
		Priority:  req.Priority,
		Active:    true,
		CreatedBy: claims.UserID,
	}

	if err := h.centralRepo.CreateAnnouncement(r.Context(), a); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, a)
}
