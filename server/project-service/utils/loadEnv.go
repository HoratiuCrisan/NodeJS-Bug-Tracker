package utils

import (
	"os"

	"github.com/joho/godotenv"
)

type env struct {
	PROJECTS_COLLECTION string
	CODES_COLLECTION    string
	RABBITMQ_URL        string
	CLIENT_URL          string
}

var EnvInstances *env

func LoadEnv() error {
	if err := godotenv.Load(".env"); err != nil {
		return err
	}

	EnvInstances = &env{
		PROJECTS_COLLECTION: os.Getenv("PROJECTS"),
		CODES_COLLECTION:    os.Getenv("CODES"),
		RABBITMQ_URL:        os.Getenv("RABBITMQ_URL"),
		CLIENT_URL:          os.Getenv("CLIENT_URL"),
	}

	return nil
}
