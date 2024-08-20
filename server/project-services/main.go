package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	"github.com/bug-tracking/projects-api/application"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment file: ", err)
		return
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	firebaseURL := os.Getenv("FIREBASE_URL")

	if jwtSecret == "" {
		fmt.Println("JWT_SECRET is not set in environment file")
		return
	}

	if firebaseURL == "" {
		fmt.Println("Firebase database is not set in environment file")
		return
	}

	app := application.New(jwtSecret, firebaseURL)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)

	err := app.Start(ctx)
	defer cancel()

	if err != nil {
		fmt.Println("failed to start application: ", err)
	}
}
