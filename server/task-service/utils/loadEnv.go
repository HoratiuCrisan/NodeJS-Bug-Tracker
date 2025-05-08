package utils

import (
	"os"

	"github.com/joho/godotenv"
)

// Initialize the env structure
type env struct {
	TASKS_COLLECTION       string
	TASKS_SUBCOLLECTION    string
	RESPONSES_COLLECTION   string
	RABBITMQ_URL           string
	ROUTE                  string
	PORT                   string
	RABBITMQ_USERS         string
	RABBITMQ_LOGGER        string
	RABBITMQ_NOTIFICATIONS string
	RABBITMQ_VERSIONS      string
}

var EnvInstances *env

// LoadEnv retrieves the data fron the local env file and generates a new EnvInstance object with it
//
// Returns:
//   - error: An error that occured during the process
func LoadEnv() error {
	// Check if the env file can be loaded
	err := godotenv.Load(".env")
	if err != nil {
		return err
	}

	// Geneate a new object with the env data
	EnvInstances = &env{
		TASKS_COLLECTION:       os.Getenv("TASKS"),
		TASKS_SUBCOLLECTION:    os.Getenv("SUBTASKS"),
		RESPONSES_COLLECTION:   os.Getenv("RESPONSES"),
		RABBITMQ_URL:           os.Getenv("RABBITMQ_URL"),
		ROUTE:                  os.Getenv("ROUTE"),
		PORT:                   os.Getenv("PORT"),
		RABBITMQ_USERS:         os.Getenv("RABBITMQ_USERS"),
		RABBITMQ_LOGGER:        os.Getenv("RABBITMQ_LOGGER"),
		RABBITMQ_NOTIFICATIONS: os.Getenv("RABBITMQ_NOTIFICATIONS"),
		RABBITMQ_VERSIONS:      os.Getenv("RABBITMQ_VERSIONS"),
	}

	return nil
}
