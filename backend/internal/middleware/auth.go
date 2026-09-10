package middleware

import (
	"context"
	"net/http"
	"strings"

	"intimos/backend/internal/domain"
	"intimos/backend/pkg/response"
	"intimos/backend/pkg/token"
)

type contextKey string

const (
	UserContextKey contextKey = "currentUser"
)

func AuthMiddleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, "authorization header required")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				response.Error(w, http.StatusUnauthorized, "invalid authorization format, expected Bearer <token>")
				return
			}

			claims, err := token.ValidateToken(parts[1], secret)
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetCurrentUser(ctx context.Context) *token.Claims {
	claims, ok := ctx.Value(UserContextKey).(*token.Claims)
	if !ok {
		return nil
	}
	return claims
}

func RequireRoles(allowedRoles ...domain.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims := GetCurrentUser(r.Context())
			if claims == nil {
				response.Error(w, http.StatusUnauthorized, "unauthenticated")
				return
			}

			userRole := domain.Role(claims.Role)
			// Superadmin always has access
			if userRole == domain.RoleSuperAdmin {
				next.ServeHTTP(w, r)
				return
			}

			allowed := false
			for _, role := range allowedRoles {
				if userRole == role {
					allowed = true
					break
				}
			}

			if !allowed {
				response.Error(w, http.StatusForbidden, "access denied for this role")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
