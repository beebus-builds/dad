package middleware

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/pkg/response"
	"golang.org/x/time/rate"
)

type ipLimiter struct {
	lim  *rate.Limiter
	last time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*ipLimiter
	r        rate.Limit
	burst    int
}

func NewRateLimiter(perMinute int) *RateLimiter {
	return &RateLimiter{
		visitors: make(map[string]*ipLimiter),
		r:        rate.Limit(float64(perMinute) / 60.0),
		burst:    perMinute,
	}
}

func (l *RateLimiter) get(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()
	v, ok := l.visitors[ip]
	if !ok || time.Since(v.last) > 10*time.Minute {
		v = &ipLimiter{lim: rate.NewLimiter(l.r, l.burst)}
		l.visitors[ip] = v
	}
	v.last = time.Now()
	return v.lim
}

func (l *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		lim := l.get(c.ClientIP())
		if !lim.Allow() {
			response.Error(c, 429, "RATE_LIMIT", "too many requests")
			return
		}
		c.Next()
	}
}
