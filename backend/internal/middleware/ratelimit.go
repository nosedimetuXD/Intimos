package middleware

import (
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"intimos/backend/pkg/response"
)

type ipEntry struct {
	tokens     float64
	lastRefill time.Time
}

// IPRateLimiter is a thread-safe token bucket rate limiter per client IP.
type IPRateLimiter struct {
	mu         sync.Mutex
	entries    map[string]*ipEntry
	rate       float64       // tokens per second
	burst      float64       // max bucket capacity
	window     time.Duration // window duration for reporting
	cleanupTicker *time.Ticker
}

// NewIPRateLimiter creates a new rate limiter with specified max requests per duration window.
func NewIPRateLimiter(maxRequests int, window time.Duration) *IPRateLimiter {
	rate := float64(maxRequests) / window.Seconds()
	limiter := &IPRateLimiter{
		entries:       make(map[string]*ipEntry),
		rate:          rate,
		burst:         float64(maxRequests),
		window:        window,
		cleanupTicker: time.NewTicker(2 * window),
	}

	// Periodic garbage collection for stale IP entries
	go func() {
		for range limiter.cleanupTicker.C {
			limiter.cleanup(window)
		}
	}()

	return limiter
}

func (l *IPRateLimiter) cleanup(staleThreshold time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	for ip, entry := range l.entries {
		if now.Sub(entry.lastRefill) > staleThreshold {
			delete(l.entries, ip)
		}
	}
}

// Allow checks if the given IP is allowed to make a request and consumes a token if available.
func (l *IPRateLimiter) Allow(ip string) (bool, time.Duration) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	entry, exists := l.entries[ip]
	if !exists {
		l.entries[ip] = &ipEntry{
			tokens:     l.burst - 1,
			lastRefill: now,
		}
		return true, 0
	}

	// Refill tokens based on elapsed time
	elapsed := now.Sub(entry.lastRefill).Seconds()
	entry.tokens += elapsed * l.rate
	if entry.tokens > l.burst {
		entry.tokens = l.burst
	}
	entry.lastRefill = now

	if entry.tokens >= 1.0 {
		entry.tokens -= 1.0
		return true, 0
	}

	// Calculate wait time for the next token
	tokensNeeded := 1.0 - entry.tokens
	retryAfter := time.Duration((tokensNeeded / l.rate) * float64(time.Second))
	if retryAfter < time.Second {
		retryAfter = time.Second
	}

	return false, retryAfter
}

// ExtractIP retrieves the client's public IP from request headers or remote address.
func ExtractIP(r *http.Request) string {
	// Check X-Forwarded-For header first (standard behind proxies like Vercel, Traefik, Cloudflare)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if net.ParseIP(ip) != nil {
				return ip
			}
		}
	}

	// Check X-Real-IP
	if xrip := strings.TrimSpace(r.Header.Get("X-Real-IP")); xrip != "" {
		if net.ParseIP(xrip) != nil {
			return xrip
		}
	}

	// Fallback to RemoteAddr (populated by chi.RealIP middleware)
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}

	return r.RemoteAddr
}

// Middleware returns an HTTP middleware enforcing this rate limit.
func (l *IPRateLimiter) Middleware(actionName string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := ExtractIP(r)
			allowed, retryAfter := l.Allow(ip)
			if !allowed {
				retrySeconds := int(retryAfter.Seconds())
				if retrySeconds <= 0 {
					retrySeconds = 1
				}
				w.Header().Set("Retry-After", fmt.Sprintf("%d", retrySeconds))
				msg := fmt.Sprintf("Demasiadas solicitudes (%s). Por favor intente en %d segundos.", actionName, retrySeconds)
				response.Error(w, http.StatusTooManyRequests, msg)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
