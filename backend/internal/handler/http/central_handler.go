package http

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"golang.org/x/crypto/bcrypt"
	"intimos/backend/internal/domain"
	"intimos/backend/internal/middleware"
	"intimos/backend/internal/repository/postgres"
	"intimos/backend/pkg/response"
)

type CentralHandler struct {
	userRepo    *postgres.UserRepository
	centralRepo *postgres.CentralRepository
	pointsRepo  *postgres.PointsRepository
}

func NewCentralHandler(userRepo *postgres.UserRepository, centralRepo *postgres.CentralRepository, pointsRepo *postgres.PointsRepository) *CentralHandler {
	return &CentralHandler{
		userRepo:    userRepo,
		centralRepo: centralRepo,
		pointsRepo:  pointsRepo,
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

func (h *CentralHandler) ListAllAnnouncements(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListAllAnnouncements(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type UpdateAnnouncementRequest struct {
	Title     string     `json:"title"`
	Content   string     `json:"content"`
	Priority  string     `json:"priority"`
	Active    bool       `json:"active"`
	ExpiresAt *time.Time `json:"expires_at"`
}

func (h *CentralHandler) UpdateAnnouncement(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateAnnouncementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	a := &domain.Announcement{
		ID:        id,
		Title:     req.Title,
		Content:   req.Content,
		Priority:  req.Priority,
		Active:    req.Active,
		ExpiresAt: req.ExpiresAt,
	}

	if err := h.centralRepo.UpdateAnnouncement(r.Context(), a); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, a)
}

func (h *CentralHandler) DeleteAnnouncement(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeleteAnnouncement(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "aviso eliminado")
}

// ── DIRECTORY & USER MGMT ──────────────────────────────────────────────────
func (h *CentralHandler) GetDirectory(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.ListWithDetails(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, users)
}

type CreateUserAdminRequest struct {
	FullName string      `json:"full_name"`
	Email    string      `json:"email"`
	Password string      `json:"password"`
	Phone    string      `json:"phone"`
	Role     domain.Role `json:"role"`
}

func (h *CentralHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req CreateUserAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}
	if req.Email == "" || req.FullName == "" {
		response.Error(w, http.StatusBadRequest, "nombre y email requeridos")
		return
	}
	if req.Password == "" {
		req.Password = "1234"
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "error al encriptar contraseña")
		return
	}

	u := &domain.User{
		Email:        req.Email,
		FullName:     req.FullName,
		PasswordHash: string(hash),
		Phone:        req.Phone,
		Role:         req.Role,
		Active:       true,
	}
	if u.Role == "" {
		u.Role = domain.RoleMiembro
	}

	if err := h.userRepo.Create(r.Context(), u); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, u)
}

type UpdateNotesRequest struct {
	Notes string `json:"notes"`
}

func (h *CentralHandler) UpdateUserNotes(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	var req UpdateNotesRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	if err := h.userRepo.UpdateNotes(r.Context(), userID, req.Notes); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "nota actualizada")
}

func (h *CentralHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")
	if err := h.userRepo.Delete(r.Context(), userID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "usuario eliminado")
}

func (h *CentralHandler) ExportUsersCSV(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.ListWithDetails(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	buf := &bytes.Buffer{}
	writer := csv.NewWriter(buf)
	_ = writer.Write([]string{"ID", "Nombre", "Email", "Teléfono", "Rol", "Cumpleaños", "Dirección", "Profesión", "Habilidades", "Puntos Mes", "Puntos Total", "Asistencia %"})

	for _, u := range users {
		bday := ""
		if u.Birthday != nil {
			bday = u.Birthday.Format("2006-01-02")
		}
		_ = writer.Write([]string{
			u.ID, u.FullName, u.Email, u.Phone, string(u.Role), bday,
			u.Address, u.Profession, u.Skills,
			fmt.Sprintf("%d", u.MonthPoints), fmt.Sprintf("%d", u.TotalPoints),
			fmt.Sprintf("%d%%", u.AttendanceRate),
		})
	}
	writer.Flush()

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", `attachment; filename="usuarios_intimos.csv"`)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(buf.Bytes())
}

type UpdateProfileRequest struct {
	FullName   string     `json:"full_name"`
	Phone      string     `json:"phone"`
	Birthday   *time.Time `json:"birthday"`
	Address    string     `json:"address"`
	Profession string     `json:"profession"`
	Skills     string     `json:"skills"`
	AvatarURL  string     `json:"avatar_url"`
}

func (h *CentralHandler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	u := &domain.User{
		ID:         claims.UserID,
		FullName:   req.FullName,
		Phone:      req.Phone,
		Birthday:   req.Birthday,
		Address:    req.Address,
		Profession: req.Profession,
		Skills:     req.Skills,
		AvatarURL:  req.AvatarURL,
	}

	if err := h.userRepo.UpdateProfile(r.Context(), u); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, u)
}

type PrayerPartnerRequest struct {
	PartnerID string `json:"partner_id"`
}

func (h *CentralHandler) SetPrayerPartner(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req PrayerPartnerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if err := h.userRepo.SetPrayerPartner(r.Context(), claims.UserID, req.PartnerID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "pareja de oración actualizada")
}

func (h *CentralHandler) GetBirthdays(w http.ResponseWriter, r *http.Request) {
	users, err := h.userRepo.GetBirthdays(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, users)
}

// ── CAMPAMENTO & FINANZAS EXTRA ────────────────────────────────────────────
func (h *CentralHandler) GetCampSummary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.centralRepo.GetCampSummary(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, summary)
}

func (h *CentralHandler) DeleteCampPayment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeleteCampPayment(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "pago de campamento eliminado")
}

func (h *CentralHandler) DeleteFinance(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeleteFinance(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "registro financiero eliminado")
}

// ── SUGGESTIONS (MI VOZ & CENTRAL SUGERENCIAS) ──────────────────────────────
func (h *CentralHandler) ListMySuggestions(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	list, err := h.centralRepo.ListUserSuggestions(r.Context(), claims.UserID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *CentralHandler) ListAllSuggestions(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListAllSuggestions(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreateSuggestionRequest struct {
	Category string `json:"category"`
	Content  string `json:"content"`
}

func (h *CentralHandler) CreateSuggestion(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req CreateSuggestionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	if req.Content == "" {
		response.Error(w, http.StatusBadRequest, "el contenido no puede estar vacío")
		return
	}

	s := &domain.Suggestion{
		UserID:   claims.UserID,
		Category: req.Category,
		Content:  req.Content,
		Status:   "recibida",
	}

	if err := h.centralRepo.CreateSuggestion(r.Context(), s); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, s)
}

type UpdateSuggestionStatusRequest struct {
	Status   string `json:"status"`
	Feedback string `json:"feedback"`
}

func (h *CentralHandler) UpdateSuggestionStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req UpdateSuggestionStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo de solicitud inválido")
		return
	}

	if err := h.centralRepo.UpdateSuggestionStatus(r.Context(), id, req.Status, req.Feedback); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "sugerencia actualizada")
}

// ── BANCO DE IDEAS ─────────────────────────────────────────────────────────
func (h *CentralHandler) ListIdeas(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListIdeas(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreateIdeaRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Tags        []string `json:"tags"`
}

func (h *CentralHandler) CreateIdea(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	var req CreateIdeaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	idea := &domain.Idea{
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Tags:        req.Tags,
		CreatedBy:   &claims.UserID,
	}

	if err := h.centralRepo.CreateIdea(r.Context(), idea); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, idea)
}

func (h *CentralHandler) UpdateIdea(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateIdeaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	idea := &domain.Idea{
		ID:          id,
		Title:       req.Title,
		Description: req.Description,
		Category:    req.Category,
		Tags:        req.Tags,
	}

	if err := h.centralRepo.UpdateIdea(r.Context(), idea); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, idea)
}

func (h *CentralHandler) DeleteIdea(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeleteIdea(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "idea eliminada")
}

// ── RETOS SEMANALES ────────────────────────────────────────────────────────
func (h *CentralHandler) ListWeeklyChallenges(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	userID := ""
	if claims != nil {
		userID = claims.UserID
	}

	list, err := h.centralRepo.ListWeeklyChallenges(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *CentralHandler) GetActiveWeeklyChallenge(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	userID := ""
	if claims != nil {
		userID = claims.UserID
	}

	challenge, err := h.centralRepo.GetActiveWeeklyChallenge(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, challenge)
}

type CreateWeeklyChallengeRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Points      int    `json:"points"`
}

func (h *CentralHandler) CreateWeeklyChallenge(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	var req CreateWeeklyChallengeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if req.Points <= 0 {
		req.Points = 150
	}

	c := &domain.WeeklyChallenge{
		Title:       req.Title,
		Description: req.Description,
		Points:      req.Points,
		Active:      true,
		CreatedBy:   &claims.UserID,
	}

	if err := h.centralRepo.CreateWeeklyChallenge(r.Context(), c); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, c)
}

func (h *CentralHandler) ToggleWeeklyChallenge(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.ToggleWeeklyChallenge(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "estado de reto actualizado")
}

func (h *CentralHandler) CompleteWeeklyChallenge(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	if err := h.centralRepo.CompleteWeeklyChallenge(r.Context(), id, claims.UserID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Award challenge points
	_ = h.pointsRepo.Add(r.Context(), &domain.PointsLedger{
		UserID:   claims.UserID,
		Points:   150,
		Reason:   "Reto de la semana completado",
		Category: domain.CategoryChallenge,
	})

	response.Message(w, http.StatusOK, "reto completado exitosamente (+150 pts)")
}

// ── GRUPOS / CÉLULAS ──────────────────────────────────────────────────────
func (h *CentralHandler) ListGroups(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListGroups(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreateGroupRequest struct {
	Name        string  `json:"name"`
	LeaderID    *string `json:"leader_id"`
	Description string  `json:"description"`
}

func (h *CentralHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	var req CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	g := &domain.Group{
		Name:        req.Name,
		LeaderID:    req.LeaderID,
		Description: req.Description,
	}

	if err := h.centralRepo.CreateGroup(r.Context(), g); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, g)
}

func (h *CentralHandler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req CreateGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	g := &domain.Group{
		ID:          id,
		Name:        req.Name,
		LeaderID:    req.LeaderID,
		Description: req.Description,
	}

	if err := h.centralRepo.UpdateGroup(r.Context(), g); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, g)
}

type GroupMemberRequest struct {
	UserID string `json:"user_id"`
}

func (h *CentralHandler) AddGroupMember(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "id")
	var req GroupMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if err := h.centralRepo.AddGroupMember(r.Context(), groupID, req.UserID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "miembro agregado al grupo")
}

func (h *CentralHandler) RemoveGroupMember(w http.ResponseWriter, r *http.Request) {
	groupID := chi.URLParam(r, "id")
	userID := chi.URLParam(r, "userId")

	if err := h.centralRepo.RemoveGroupMember(r.Context(), groupID, userID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "miembro removido del grupo")
}

func (h *CentralHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeleteGroup(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "grupo eliminado exitosamente")
}

// ── PLAYLISTS ─────────────────────────────────────────────────────────────
func (h *CentralHandler) ListPlaylists(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListPlaylists(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreatePlaylistRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	URL         string `json:"url"`
	CoverURL    string `json:"cover_url"`
}

func (h *CentralHandler) CreatePlaylist(w http.ResponseWriter, r *http.Request) {
	var req CreatePlaylistRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	p := &domain.Playlist{
		Title:       req.Title,
		Description: req.Description,
		URL:         req.URL,
		CoverURL:    req.CoverURL,
		Active:      true,
	}

	if err := h.centralRepo.CreatePlaylist(r.Context(), p); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, p)
}

func (h *CentralHandler) DeletePlaylist(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.centralRepo.DeletePlaylist(r.Context(), id); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.Message(w, http.StatusOK, "playlist eliminada")
}

// ── FEATURE FLAGS ──────────────────────────────────────────────────────────
func (h *CentralHandler) ListFeatureFlags(w http.ResponseWriter, r *http.Request) {
	flags, err := h.centralRepo.ListFeatureFlags(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, flags)
}

func (h *CentralHandler) SaveFeatureFlag(w http.ResponseWriter, r *http.Request) {
	var f domain.FeatureFlag
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if err := h.centralRepo.SaveFeatureFlag(r.Context(), &f); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, f)
}

// ── SETTINGS & PUNTOS CONFIG ───────────────────────────────────────────────
func (h *CentralHandler) GetPointsConfig(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.centralRepo.GetSetting(r.Context(), "points_config")
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, cfg)
}

func (h *CentralHandler) SavePointsConfig(w http.ResponseWriter, r *http.Request) {
	var val map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&val); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if err := h.centralRepo.SaveSetting(r.Context(), "points_config", val); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, val)
}

func (h *CentralHandler) GetQRSettings(w http.ResponseWriter, r *http.Request) {
	cfg, err := h.centralRepo.GetSetting(r.Context(), "qr_settings")
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, cfg)
}

func (h *CentralHandler) SaveQRSettings(w http.ResponseWriter, r *http.Request) {
	var val map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&val); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	if err := h.centralRepo.SaveSetting(r.Context(), "qr_settings", val); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, val)
}

// ── REFLECTIONS REVIEW & PUBLICS ───────────────────────────────────────────
func (h *CentralHandler) ListPublicReflections(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListReflections(r.Context(), true)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

func (h *CentralHandler) ListAllReflections(w http.ResponseWriter, r *http.Request) {
	list, err := h.centralRepo.ListReflections(r.Context(), false)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, list)
}

type CreateReflectionRequest struct {
	VerseRef string `json:"verse_ref"`
	Content  string `json:"content"`
	IsPublic bool   `json:"is_public"`
}

func (h *CentralHandler) CreateReflection(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	var req CreateReflectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	ref := &domain.Reflection{
		UserID:   claims.UserID,
		VerseRef: req.VerseRef,
		Content:  req.Content,
		Status:   "approved",
		IsPublic: req.IsPublic,
	}

	if err := h.centralRepo.CreateReflection(r.Context(), ref); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Award 25 points for reflection
	_ = h.pointsRepo.Add(r.Context(), &domain.PointsLedger{
		UserID:   claims.UserID,
		Points:   25,
		Reason:   fmt.Sprintf("Reflexión: %s", req.VerseRef),
		Category: domain.CategoryReflection,
	})

	response.JSON(w, http.StatusCreated, ref)
}

type ModerateReflectionRequest struct {
	Status       string `json:"status"`
	Feedback     string `json:"feedback"`
	IsPublic     bool   `json:"is_public"`
	RevokePoints bool   `json:"revoke_points"`
	UserID       string `json:"user_id"`
}

func (h *CentralHandler) ModerateReflection(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	claims := middleware.GetCurrentUser(r.Context())
	var req ModerateReflectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}

	reviewerID := ""
	if claims != nil {
		reviewerID = claims.UserID
	}

	if err := h.centralRepo.ModerateReflection(r.Context(), id, req.Status, req.Feedback, req.IsPublic, reviewerID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if req.RevokePoints && req.UserID != "" {
		_ = h.pointsRepo.Add(r.Context(), &domain.PointsLedger{
			UserID:   req.UserID,
			Points:   -25,
			Reason:   "Anulación de reflexión por moderación",
			Category: domain.CategoryReflection,
		})
	}

	response.Message(w, http.StatusOK, "reflexión moderada exitosamente")
}

// ── ANALYTICS & STATS ──────────────────────────────────────────────────────
func (h *CentralHandler) GetGameAnalytics(w http.ResponseWriter, r *http.Request) {
	analytics, err := h.centralRepo.GetGameAnalytics(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, analytics)
}

func (h *CentralHandler) GetCentralStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.centralRepo.GetCentralStats(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, stats)
}
