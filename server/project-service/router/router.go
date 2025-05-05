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
	"github.com/horatiucrisan/project-service/utils"
)

// NewRouter uses Chi framework in order to generate the go project-service router
//
// Parameters:
//   - userProducer: The rabbitMq user producer
//   - logProducer: The rabbitMq log producer
//   - notificationProducer: The rabbitmq notification producer
//
// Returns:
//   - http.Handler: The http request handler
//   - error: An error that occured during the process
func NewRouter(userProducer *rabbitmq.UserProducer, logProducer, notificationProducer *rabbitmq.ProjectProducer) (http.Handler, error) {
	// Generate a new chi router
	r := chi.NewRouter()

	// Initialize the router context
	ctx := context.Background()

	// Initialize the firebase clients
	firebaseClient, authClient, err := firebase.NewFirebaseClient(ctx)
	if err != nil {
		return nil, err
	}

	// Initialize the repository layer
	projectRepo := repository.NewProjectRepository(firebaseClient)

	// Initialize the service layer
	projectService := service.NewProjectService(projectRepo)

	// Initialize the controller layer
	projectController := controller.NewProjectController(projectService, userProducer, logProducer, notificationProducer)

	// Initialize the routes
	projectRoutes(r, authClient, projectController)

	return r, nil
}

// projectRoutes initializes the request routes available
//
// Parameters:
//   - r: The go chi router
//   - authClient: The firestore authentication client
//   - projectController: The controller layer object
func projectRoutes(r chi.Router, authClient *auth.Client, projectController interfaces.ProjectController) {
	r.Route(utils.EnvInstances.ROUTE, func(r chi.Router) {
		// Use the user token validation method
		r.Use(middleware.AuthMiddleware(authClient))

		// POST routes
		r.Post("/", projectController.CreateProject)
		r.Post("/{projectId}/link", projectController.GenerateInvitationLink)

		//GET routes
		r.Get("/", projectController.GetProjects)
		r.Get("/{userId}/user", projectController.GetUserProjects)
		r.Get("/{projectId}", projectController.GetProjectById)

		// PUT routes
		r.Put("/{projectId}/title", projectController.UpdateProjectTitle)
		r.Put("/{projectId}/description", projectController.UpdateProjectDescription)
		r.Put("/{projectId}/manager", projectController.UpdateProjectManager)
		r.Put("/{projectId}/addMembers", projectController.AddProjectMembers)
		r.Put("/{projectId}/removeMembers", projectController.RemoveProjectMembers)

		// DELETE routes
		r.Delete("/{projectId}", projectController.DeleteProjectById)
	})
}
