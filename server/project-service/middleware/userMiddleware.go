package middleware

import (
	"context"
	"errors"

	"firebase.google.com/go/v4/auth"
)

// GetUserFromContext retrieves the request context and returns the data of the user
//
// Parameters:
//   - ctx: Request-scoped context
//
// Returns:
//   - *auth.Token: The auth data of the user based on the jwt token
//   - error: An error that occured during the process
func GetUserFromContext(ctx context.Context) (*auth.Token, error) {
	// Get the user data from the request context
	user, ok := ctx.Value("firebaseUser").(*auth.Token)
	if !ok || user == nil {
		return nil, errors.New("user data not found")
	}

	return user, nil
}
