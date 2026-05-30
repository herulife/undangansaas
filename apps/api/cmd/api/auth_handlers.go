package main

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

const authTokenTTL = 30 * 24 * time.Hour

func (a *app) register(w http.ResponseWriter, r *http.Request) {
	var payload authRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	email := normalizeEmail(payload.Email)
	password := strings.TrimSpace(payload.Password)
	displayName := strings.TrimSpace(payload.DisplayName)
	if displayName == "" {
		displayName = strings.Split(email, "@")[0]
	}
	if err := validateAuthInput(email, password); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	user, err := a.insertUser(r, email, displayName, string(hash))
	if err != nil {
		writeError(w, http.StatusConflict, errors.New("email already registered"))
		return
	}

	a.writeAuthResponse(w, user, http.StatusCreated)
}

func (a *app) login(w http.ResponseWriter, r *http.Request) {
	var payload authRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, errors.New("invalid json payload"))
		return
	}

	email := normalizeEmail(payload.Email)
	password := strings.TrimSpace(payload.Password)
	if err := validateAuthInput(email, password); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	var user authUserPublic
	var hash string
	err := a.db.QueryRow(r.Context(), `
		select id::text, email, display_name, role, tier, coalesce(password_hash, '')
		from users
		where lower(email) = lower($1)
	`, email).Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role, &user.Tier, &hash)
	if errors.Is(err, pgx.ErrNoRows) || bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) != nil {
		writeError(w, http.StatusUnauthorized, errors.New("invalid email or password"))
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	a.writeAuthResponse(w, user, http.StatusOK)
}

func (a *app) authMe(w http.ResponseWriter, r *http.Request) {
	current, ok := currentUserFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, errors.New("authentication required"))
		return
	}

	var user authUserPublic
	err := a.db.QueryRow(r.Context(), `
		select id::text, email, display_name, role, tier
		from users
		where id = $1
	`, current.ID).Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role, &user.Tier)
	if err != nil {
		writeError(w, http.StatusUnauthorized, errors.New("user not found"))
		return
	}

	writeJSON(w, user)
}

func (a *app) insertUser(r *http.Request, email string, displayName string, passwordHash string) (authUserPublic, error) {
	var user authUserPublic
	err := a.db.QueryRow(r.Context(), `
		insert into users (email, display_name, password_hash, role, tier)
		values ($1, $2, $3, 'user', 'free')
		returning id::text, email, display_name, role, tier
	`, email, displayName, passwordHash).Scan(&user.ID, &user.Email, &user.DisplayName, &user.Role, &user.Tier)
	return user, err
}

func (a *app) writeAuthResponse(w http.ResponseWriter, user authUserPublic, status int) {
	token, err := signJWT(user.ID, authTokenTTL, env("JWT_SECRET", "dev-secret-change-me"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(authResponse{Token: token, User: user})
}

func normalizeEmail(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func validateAuthInput(email string, password string) error {
	if !strings.Contains(email, "@") || !strings.Contains(email, ".") {
		return errors.New("valid email is required")
	}
	if len(password) < 8 {
		return errors.New("password must be at least 8 characters")
	}
	return nil
}
