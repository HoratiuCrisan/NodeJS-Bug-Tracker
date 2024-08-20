package application

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/go-chi/chi/v5"
	"google.golang.org/api/option"
)

type App struct {
	router       http.Handler
	client       *firestore.Client
	jwtKey       []byte
	firebase_URL string
}

func New(jwtSecret string, firebase_url string) *App {
	app := &App{
		jwtKey:       []byte(jwtSecret),
		firebase_URL: firebase_url,
	}

	return app
}

func (a *App) Start(ctx context.Context) error {
	/*conf := &firebase.Config{
		DatabaseURL: a.firebase_URL,
	}*/

	opt := option.WithCredentialsFile("config/serviceAccount.json")

	firebaseApp, err := firebase.NewApp(context.Background(), nil, opt)

	if err != nil {
		return fmt.Errorf("error initializing app: %v", err)
	}

	cnt, err := firebaseApp.Firestore(context.Background())

	if err != nil {
		return fmt.Errorf("error initializing database client: %v", err)
	}

	a.client = cnt

	a.router = a.loadRoutes()

	server := &http.Server{
		Addr:    ":8001",
		Handler: a.router,
	}

	defer func() {
		// TODO DB CLOSING
	}()

	fmt.Println("Starting server...")

	ch := make(chan error, 1)

	go func() {
		err := server.ListenAndServe()

		if err != nil {
			ch <- fmt.Errorf("failed to start server: %w", err)
		}

		close(ch)
	}()

	select {
	case err := <-ch:
		return err
	case <-ctx.Done():
		timeout, cancel := context.WithTimeout(context.Background(), time.Second*10)
		defer cancel()

		return server.Shutdown(timeout)
	}
}

func (a *App) loadRoutes() *chi.Mux {
	return loadRoutes(a.client, a.jwtKey)
}
