package main

import (
	"context"
	"fmt"

	"github.com/bugtracker/project-services/application"
)

func main() {
	app := application.New()

	err := app.Start(context.TODO())

	if err != nil {
		fmt.Println("failed to start server: ", err)
	}
}
