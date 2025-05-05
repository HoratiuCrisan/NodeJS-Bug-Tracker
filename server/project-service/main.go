package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/horatiucrisan/project-service/rabbitmq"
	"github.com/horatiucrisan/project-service/router"
	"github.com/horatiucrisan/project-service/utils"
)

func main() {
	// Initalize the .env data
	if err := utils.LoadEnv(); err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq user producer
	userProducer, err := rabbitmq.NewUserProducer(utils.EnvInstances.RABBITMQ_USERS)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq logger producer
	logProducer, err := rabbitmq.NewProjectProducer(utils.EnvInstances.RABBITMQ_LOGGER)
	if err != nil {
		log.Fatal(err)
	}

	// Initialize a new rabbitMq notification producer
	notificationProducer, err := rabbitmq.NewProjectProducer(utils.EnvInstances.RABBITMQ_NOTIFICATIONS)
	if err != nil {
		log.Fatal(err)
	}

	// Initalize the chi router
	// Pass the rabbitMq producers to have access to them from the controllers
	router, err := router.NewRouter(userProducer, logProducer, notificationProducer)
	if err != nil {
		log.Fatal(err)
	}

	// Listen to the port
	log.Printf("Listening to port %s\n", utils.EnvInstances.PORT)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", utils.EnvInstances.PORT), router); err != nil {
		log.Fatal(err)
	}
}
