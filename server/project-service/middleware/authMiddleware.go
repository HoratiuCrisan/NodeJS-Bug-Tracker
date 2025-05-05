package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
)

// AuthMiddleware retrieves data and add the user data to the context
//
// Parameters:
//   - firebaseAuth: The firebase auth client
func AuthMiddleware(firebaseAuth *auth.Client) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		// Return the handler function
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Retrieve the token of the user
			idToken, err := extractTokenFromHeader(r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			// Check if the token was retrieved
			if idToken == "" {
				http.Error(w, "Invalid token data", http.StatusUnauthorized)
				return
			}

			// Verify the validity of the user token
			token, err := firebaseAuth.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				http.Error(w, err.Error(), http.StatusUnauthorized)
				return
			}

			// Add the user data to the request context
			ctx := context.WithValue(r.Context(), "firebaseUser", token)
			r = r.WithContext(ctx)

			next.ServeHTTP(w, r)
		})
	}
}

// extractTokenFromHeader retrieves the request data and retrieves the user token
//
// Parameters:
//   - r: The method request data
//
// Returns:
//   - string: The user token
//   - error: An error that occured during the process
func extractTokenFromHeader(r *http.Request) (string, error) {
	// Retrieve the authorization data from the request header
	authHeader := r.Header.Get("Authorization")

	// Check if the data is missing
	if authHeader == "" {
		return "", errors.New("authorization header missing")
	}

	// Split the data into two strings
	parts := strings.SplitN(authHeader, " ", 2)

	// Check if the data was split into two strings and if the first is the bearer name
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", errors.New("invalid authorization header format")
	}

	// Return the user token
	return parts[1], nil
}
