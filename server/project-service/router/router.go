package router

import (
	"context"
	"net/http"

	"firebase.google.com/go/v4/auth"
	"github.com/go-chi/chi/v5"
	"github.com/horatiucrisan/project-service/controller"
	"github.com/horatiucrisan/project-service/firebase"
	"github.com/horatiucrisan/project-service/interfaces"
	"github.com/horatiucrisan/project-service/middleware"
	"github.com/horatiucrisan/project-service/rabbitmq"
	"github.com/horatiucrisan/project-service/repository"
	"github.com/horatiucrisan/project-service/service"
)

func NewRouter(userProducer *rabbitmq.UserProducer, logProducer, notificationProducer *rabbitmq.ProjectProducer) (http.Handler, error) {
	r := chi.NewRouter()

	ctx := context.Background()
	firebaseClient, authClient, err := firebase.NewFirebaseClient(ctx)
	if err != nil {
		return nil, err
	}

	projectRepo := repository.NewProjectRepository(firebaseClient)
	projectService := service.NewProjectService(projectRepo)
	projectController := controller.NewProjectController(projectService, userProducer, logProducer, notificationProducer)

	projectRoutes(r, authClient, projectController)

	return r, nil
}

func projectRoutes(r chi.Router, authClient *auth.Client, projectController interfaces.ProjectController) {
	r.Route("/api/projects", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware(authClient))

		r.Post("/", projectController.CreateProject)
		r.Post("/{projectId}/link", projectController.GenerateInvitationLink)

		r.Get("/", projectController.GetProjects)
		r.Get("/{userId}/user", projectController.GetUserProjects)
		r.Get("/{projectId}", projectController.GetProjectById)

		r.Put("/{projectId}/title", projectController.UpdateProjectTitle)
		r.Put("/{projectId}/description", projectController.UpdateProjectDescription)
		r.Put("/{projectId}/manager", projectController.UpdateProjectManager)
		r.Put("/{projectId}/addMembers", projectController.AddProjectMembers)
		r.Put("/{projectId}/removeMembers", projectController.RemoveProjectMembers)

		r.Delete("/{projectId}", projectController.DeleteProjectById)
	})
}
