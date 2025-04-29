package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
)

func AuthMiddleware(firebaseAuth *auth.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			idToken, err := extractTokenFromHeader(r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			if idToken == "" {
				http.Error(w, "Invalid token data", http.StatusUnauthorized)
				return
			}

			token, err := firebaseAuth.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), "firebaseUser", token)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}

func extractTokenFromHeader(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")

	if authHeader == "" {
		return "", errors.New("authorization header missing")
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", errors.New("invalid authorization header format")
	}

	return parts[1], nil
}
