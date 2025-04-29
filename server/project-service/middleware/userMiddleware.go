package middleware

import (
	"context"
	"errors"

	"firebase.google.com/go/v4/auth"
)

func GetUserFromContext(ctx context.Context) (*auth.Token, error) {
	user, ok := ctx.Value("firebaseUser").(*auth.Token)
	if !ok || user == nil {
		return nil, errors.New("user data not found")
	}

	return user, nil
}
