package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/horatiucrisan/task-service/rabbitmq"
	"github.com/horatiucrisan/task-service/router"
	"github.com/horatiucrisan/task-service/utils"
)

func main() {
	// Initialize the .env data
	if err := utils.LoadEnv(); err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq user producer
	userProducer, err := rabbitmq.NewUserProducer(utils.EnvInstances.RABBITMQ_USERS)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq log producer
	loggerProducer, err := rabbitmq.NewTaskProducer(utils.EnvInstances.RABBITMQ_LOGGER)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq notification producer
	notificationProducer, err := rabbitmq.NewTaskProducer(utils.EnvInstances.RABBITMQ_NOTIFICATIONS)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq version produer
	versionProducer, err := rabbitmq.NewTaskProducer(utils.EnvInstances.RABBITMQ_VERSIONS)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize the chi router
	// Pass the rabbitMq producers to have access to them from the controllers
	router, err := router.NewRouter(userProducer, loggerProducer, notificationProducer, versionProducer)
	if err != nil {
		log.Fatalf("Failed to initialize router: %v", err)
	}

	// Listen to the server port
	log.Printf("Listening to port %s", utils.EnvInstances.PORT)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", utils.EnvInstances.PORT), router); err != nil {
		log.Fatal(err)
	}
}
