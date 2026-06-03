package main

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateBucket struct {
	count   int
	resetAt time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	buckets map[string]rateBucket
}

func newRateLimiter() *rateLimiter {
	return &rateLimiter{buckets: map[string]rateBucket{}}
}

func (a *app) rateLimitMiddleware(scope string, limit int, windowSeconds int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !a.allowRate(scope+":"+clientIP(r), limit, time.Duration(windowSeconds)*time.Second) {
				writeError(w, http.StatusTooManyRequests, errRateLimited)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (a *app) allowRate(key string, limit int, window time.Duration) bool {
	if a == nil || a.limiter == nil {
		return true
	}
	now := time.Now()
	a.limiter.mu.Lock()
	defer a.limiter.mu.Unlock()

	bucket := a.limiter.buckets[key]
	if bucket.resetAt.IsZero() || now.After(bucket.resetAt) {
		a.limiter.buckets[key] = rateBucket{count: 1, resetAt: now.Add(window)}
		return true
	}
	if bucket.count >= limit {
		return false
	}
	bucket.count++
	a.limiter.buckets[key] = bucket
	return true
}

func clientIP(r *http.Request) string {
	for _, header := range []string{"CF-Connecting-IP", "X-Real-IP", "X-Forwarded-For"} {
		value := strings.TrimSpace(r.Header.Get(header))
		if value == "" {
			continue
		}
		if header == "X-Forwarded-For" {
			value = strings.TrimSpace(strings.Split(value, ",")[0])
		}
		if value != "" {
			return value
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil || host == "" {
		return r.RemoteAddr
	}
	return host
}
