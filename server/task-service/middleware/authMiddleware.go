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
			// Get the json token from the request header
			idToken, err := extractTokenFromHeader(r)
			if err != nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			if idToken == "" {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			// Verify token
			token, err := firebaseAuth.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				http.Error(w, "Invalid token ID", http.StatusUnauthorized)
				return
			}

			// Add the user info to the context
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
