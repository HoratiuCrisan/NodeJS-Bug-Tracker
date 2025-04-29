package utils

import (
	"os"

	"github.com/joho/godotenv"
)

type env struct {
	TASKS_COLLECTION     string
	TASKS_SUBCOLLECTION  string
	RESPONSES_COLLECTION string
	RABBITMQ_URL         string
}

var EnvInstances *env

func LoadEnv() error {
	err := godotenv.Load(".env")
	if err != nil {
		return err
	}

	EnvInstances = &env{
		TASKS_COLLECTION:     os.Getenv("TASKS"),
		TASKS_SUBCOLLECTION:  os.Getenv("SUBTASKS"),
		RESPONSES_COLLECTION: os.Getenv("RESPONSES"),
		RABBITMQ_URL:         os.Getenv("RABBITMQ_URL"),
	}

	return nil
}
