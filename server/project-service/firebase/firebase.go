package firebase

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// NewFirebaseClient retrieves the request context
//
// Parameters:
//   - ctx: Request-scoped context
//
// Returns:
//   - *firestore.Client: The firestore client
//   - *auth.Client: The auth client
//   - error: An error that occured during the process
func NewFirebaseClient(ctx context.Context) (*firestore.Client, *auth.Client, error) {
	// Get the firebase credentials
	opt := option.WithCredentialsFile("config/serviceAccount.json")

	// Generate a new firebase app
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, nil, err
	}

	// Retrieve the client data from the firestore
	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, nil, err
	}

	// Retrieve the auth data
	auth, err := app.Auth(ctx)
	if err != nil {
		return nil, nil, err
	}

	return client, auth, nil
}
