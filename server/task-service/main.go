package main

import (
	"log"
	"net/http"

	"github.com/horatiucrisan/task-service/rabbitmq"
	"github.com/horatiucrisan/task-service/router"
	"github.com/horatiucrisan/task-service/utils"
)

func main() {
	utils.LoadEnv()

	userProducer, err := rabbitmq.NewUserProducer(utils.EnvInstances.RABBITMQ_URL, "users")
	if err != nil {
		log.Fatal(err)
	}

	defer userProducer.Close()

	router, err := router.NewRouter(userProducer)
	if err != nil {
		log.Fatalf("Failed to initialize router: %v", err)
	}

	if err := http.ListenAndServe(":8008", router); err != nil {
		log.Fatal(err)
	}

	log.Println("Listening to port 8008")
}
