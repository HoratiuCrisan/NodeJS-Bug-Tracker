package firebase

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

func NewFirebaseClient(ctx context.Context) (*firestore.Client, *auth.Client, error) {
	opt := option.WithCredentialsFile("config/serviceAccount.json")

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, nil, err
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		return nil, nil, err
	}

	auth, err := app.Auth(ctx)
	if err != nil {
		return nil, nil, err
	}

	return client, auth, nil
}
