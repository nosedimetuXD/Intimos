package http

import (
	"net/http"

	"intimos/backend/internal/middleware"
	"intimos/backend/internal/service"
	"intimos/backend/pkg/response"
)

type BadgeHandler struct {
	badgeService *service.BadgeService
}

func NewBadgeHandler(badgeService *service.BadgeService) *BadgeHandler {
	return &BadgeHandler{badgeService: badgeService}
}

func (h *BadgeHandler) GetMyProgress(w http.ResponseWriter, r *http.Request) {
	claims := middleware.GetCurrentUser(r.Context())
	if claims == nil {
		response.Error(w, http.StatusUnauthorized, "no autenticado")
		return
	}

	badges, err := h.badgeService.GetMyBadgesProgress(r.Context(), claims.UserID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, badges)
}
