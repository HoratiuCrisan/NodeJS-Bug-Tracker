package firebase

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// NewFirebaseClient retrieves the request context and generates a new firebase app
//
// Parameters:
//   - ctx: Request-scoped context
//
// Returns:
//   - *firestore.Client: The firestore client
//   - *auth.Client: The data of the authenticated user
//   - error: An error that occured during the process
func NewFirebaseClient(ctx context.Context) (*firestore.Client, *auth.Client, error) {
	// Get the data from the firebase json service
	opt := option.WithCredentialsFile("config/serviceAccount.json")

	// Create a new firebase app
	app, err := firebase.NewApp(ctx, nil, opt)

	if err != nil {
		return nil, nil, err
	}

	// Generate a new firebase client
	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, nil, err
	}

	// Generate a new firebase authentication client
	auth, err := app.Auth(ctx)
	if err != nil {
		return nil, nil, err
	}

	return client, auth, nil
}
