package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestIPRateLimiter_Allow(t *testing.T) {
	limiter := NewIPRateLimiter(3, time.Minute)
	defer limiter.cleanupTicker.Stop()

	ip := "192.168.1.100"

	// First 3 requests should be allowed
	for i := 1; i <= 3; i++ {
		allowed, retryAfter := limiter.Allow(ip)
		if !allowed {
			t.Fatalf("request %d should be allowed, got blocked with retryAfter=%v", i, retryAfter)
		}
	}

	// 4th request must be blocked
	allowed, retryAfter := limiter.Allow(ip)
	if allowed {
		t.Fatalf("request 4 should be blocked (rate limit exceeded)")
	}
	if retryAfter <= 0 {
		t.Fatalf("expected positive retryAfter, got %v", retryAfter)
	}

	// Different IP should still be allowed
	otherIP := "192.168.1.101"
	allowedOther, _ := limiter.Allow(otherIP)
	if !allowedOther {
		t.Fatalf("request from different IP %s should be allowed", otherIP)
	}
}

func TestIPRateLimiter_Middleware(t *testing.T) {
	limiter := NewIPRateLimiter(2, time.Minute)
	defer limiter.cleanupTicker.Stop()

	handler := limiter.Middleware("test")(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}))

	// Request 1: 200 OK
	req1 := httptest.NewRequest("GET", "/api/test", nil)
	req1.RemoteAddr = "10.0.0.1:12345"
	rr1 := httptest.NewRecorder()
	handler.ServeHTTP(rr1, req1)
	if rr1.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rr1.Code)
	}

	// Request 2: 200 OK
	req2 := httptest.NewRequest("GET", "/api/test", nil)
	req2.RemoteAddr = "10.0.0.1:12345"
	rr2 := httptest.NewRecorder()
	handler.ServeHTTP(rr2, req2)
	if rr2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rr2.Code)
	}

	// Request 3: 429 Too Many Requests
	req3 := httptest.NewRequest("GET", "/api/test", nil)
	req3.RemoteAddr = "10.0.0.1:12345"
	rr3 := httptest.NewRecorder()
	handler.ServeHTTP(rr3, req3)
	if rr3.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 Too Many Requests, got %d", rr3.Code)
	}

	retryAfterHeader := rr3.Header().Get("Retry-After")
	if retryAfterHeader == "" {
		t.Fatalf("expected Retry-After header to be present on 429 response")
	}
}
