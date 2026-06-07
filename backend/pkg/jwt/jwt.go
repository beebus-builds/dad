package jwt

import (
	"errors"
	"time"

	jwtv5 "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID      string   `json:"uid"`
	Role        string   `json:"role"`
	BranchID    string   `json:"branch_id,omitempty"`
	Email       string   `json:"email"`
	Permissions []string `json:"perms"`
	Type        string   `json:"typ"`
	jwtv5.RegisteredClaims
}

type Manager struct {
	secret           []byte
	accessExpiresIn  time.Duration
	refreshExpiresIn time.Duration
	issuer           string
}

func NewManager(secret string, access, refresh time.Duration, issuer string) *Manager {
	return &Manager{secret: []byte(secret), accessExpiresIn: access, refreshExpiresIn: refresh, issuer: issuer}
}

func (m *Manager) Generate(userID, email, role, branchID string, perms []string, tokenType string) (string, time.Time, error) {
	var ttl time.Duration
	if tokenType == "refresh" {
		ttl = m.refreshExpiresIn
	} else {
		ttl = m.accessExpiresIn
	}
	exp := time.Now().Add(ttl)
	claims := Claims{
		UserID:      userID,
		Role:        role,
		BranchID:    branchID,
		Email:       email,
		Permissions: perms,
		Type:        tokenType,
		RegisteredClaims: jwtv5.RegisteredClaims{
			Issuer:    m.issuer,
			Subject:   userID,
			ExpiresAt: jwtv5.NewNumericDate(exp),
			IssuedAt:  jwtv5.NewNumericDate(time.Now()),
		},
	}
	t := jwtv5.NewWithClaims(jwtv5.SigningMethodHS256, claims)
	s, err := t.SignedString(m.secret)
	return s, exp, err
}

func (m *Manager) Parse(token string) (*Claims, error) {
	parsed, err := jwtv5.ParseWithClaims(token, &Claims{}, func(t *jwtv5.Token) (any, error) {
		if _, ok := t.Method.(*jwtv5.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return m.secret, nil
	})
	if err != nil {
		return nil, err
	}
	c, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid {
		return nil, errors.New("invalid token")
	}
	return c, nil
}
