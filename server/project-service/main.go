package main

import (
	"log"
	"net/http"

	"github.com/horatiucrisan/project-service/rabbitmq"
	"github.com/horatiucrisan/project-service/router"
	"github.com/horatiucrisan/project-service/utils"
)

func main() {
	if err := utils.LoadEnv(); err != nil {
		log.Fatal(err)
	}

	userProducer, err := rabbitmq.NewUserProducer(utils.EnvInstances.RABBITMQ_URL, "users")
	if err != nil {
		log.Fatal(err)
	}

	logProducer, err := rabbitmq.NewProjectProducer("logger")
	if err != nil {
		log.Fatal(err)
	}

	notificationProducer, err := rabbitmq.NewProjectProducer("notifications")
	if err != nil {
		log.Fatal(err)
	}

	router, err := router.NewRouter(userProducer, logProducer, notificationProducer)
	if err != nil {
		log.Fatal(err)
	}

	if err := http.ListenAndServe(":8009", router); err != nil {
		log.Fatal(err)
	}

	log.Printf("Listening to port 8009")
}
