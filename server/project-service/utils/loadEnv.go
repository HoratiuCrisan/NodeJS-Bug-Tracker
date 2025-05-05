package utils

import (
	"os"

	"github.com/joho/godotenv"
)

type env struct {
	PROJECTS_COLLECTION    string
	CODES_COLLECTION       string
	RABBITMQ_URL           string
	CLIENT_URL             string
	RABBITMQ_USERS         string
	RABBITMQ_LOGGER        string
	RABBITMQ_NOTIFICATIONS string
	PORT                   string
	ROUTE                  string
}

var EnvInstances *env

// LoadEnv initializes the data from the .env file
//
// Returns:
//   - error: An error that occured during the initialization process
func LoadEnv() error {
	// Load the env file
	if err := godotenv.Load(".env"); err != nil {
		return err
	}

	// Get the data instances from the env file
	EnvInstances = &env{
		PROJECTS_COLLECTION:    os.Getenv("PROJECTS"),
		CODES_COLLECTION:       os.Getenv("CODES"),
		RABBITMQ_URL:           os.Getenv("RABBITMQ_URL"),
		CLIENT_URL:             os.Getenv("CLIENT_URL"),
		ROUTE:                  os.Getenv("ROUTE"),
		PORT:                   os.Getenv("PORT"),
		RABBITMQ_USERS:         os.Getenv("RABBITMQ_USERS"),
		RABBITMQ_LOGGER:        os.Getenv("RABBITMQ_LOGGER"),
		RABBITMQ_NOTIFICATIONS: os.Getenv("RABBITMQ_NOTIFICATIONS"),
	}

	return nil
}
