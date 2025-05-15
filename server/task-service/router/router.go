package router

import (
	"context"
	"net/http"

	"firebase.google.com/go/v4/auth"
	"github.com/go-chi/chi/v5"
	"github.com/horatiucrisan/task-service/controller"
	"github.com/horatiucrisan/task-service/firebase"
	"github.com/horatiucrisan/task-service/interfaces"
	"github.com/horatiucrisan/task-service/middleware"
	"github.com/horatiucrisan/task-service/rabbitmq"
	"github.com/horatiucrisan/task-service/repository"
	"github.com/horatiucrisan/task-service/service"
	"github.com/horatiucrisan/task-service/utils"
)

// NewRouter uses Chi framework in order to generate the go task-service router
//
// Parameters:
//   - userProducer: The rabbitMq user producer
//   - logProducer: The rabbitMq log producer
//   - notificationProducer: The rabbitmq notification producer
//   - versionProducer: The rabbitMq version producer
//
// Returns:
//   - http.Handler: The http request handler
//   - error: An error that occured during the process
func NewRouter(userProducer *rabbitmq.UserProducer, loggerProducer, notificationProducer, versionProducer *rabbitmq.TaskProducer) (http.Handler, error) {
	// Generae a new chi router
	r := chi.NewRouter()

	// Initialize the router context
	ctx := context.Background()

	// Initialize the firebase clients
	firebaseClient, authClient, err := firebase.NewFirebaseClient(ctx)
	if err != nil {
		return nil, err
	}

	// Initialize the repository layer
	taskRepo := repository.NewTaskRepository(firebaseClient)

	// Initialize the service layer
	taskService := service.NewTaskService(taskRepo)

	// Initialize the controller layer
	taskController := controller.NewTaskController(taskService, userProducer, loggerProducer, notificationProducer, versionProducer)

	// Initialize the routes
	taskRoutes(r, authClient, taskController)

	return r, nil
}

// taskRoutes initializes the request routes available
//
// Parameters:
//   - r: The go chi router
//   - authClient: The firestore authentication client
//   - taskController: The controller layer object
func taskRoutes(r chi.Router, authClient *auth.Client, taskController interfaces.TaskController) {
	r.Route(utils.EnvInstances.ROUTE, func(r chi.Router) {
		// Use the user token validation method
		r.Use(middleware.AuthMiddleware(authClient))

		// POST routes
		r.Post("/", taskController.CreateTask)
		r.Post("/{taskId}", taskController.CreateSubtask)
		r.Post("/{taskId}/response", taskController.CreateTaskResponse)

		// GET routes
		r.Get("/{projectId}", taskController.GetTasks)
		r.Get("/{projectId}/{taskId}", taskController.GetTaskById)
		r.Get("/{taskId}/subtasks", taskController.GetSubtasks)
		r.Get("/{taskId}/responses", taskController.GetResponses)
		r.Get("/{taskId}/subtasks/{subtaskId}", taskController.GetSubtaskById)
		r.Get("/{taskId}/responses/{responseId}", taskController.GetResponseById)

		// PUT routes
		r.Put("/{taskId}/description", taskController.UpdateTaskDescription)
		r.Put("/{taskId}/status", taskController.UpdateTaskStatus)
		r.Put("/{taskId}/addHandlers", taskController.AddTaskHandlers)
		r.Put("/{taskId}/removeHandlers", taskController.RemoveTaskHandlers)
		r.Put("/{taskId}/{subtaskId}/description", taskController.UpdateSubtaskDescription)
		r.Put("/{taskId}/{subtaskId}/handler", taskController.UpdateSubtaskHandler)
		r.Put("/{taskId}/{subtaskId}/status", taskController.UpdateSubtaskStatus)
		r.Put("/{taskId}/response/{responseId}", taskController.UpdateResponseMessage)
		r.Put("/{taskId}/rollback/", taskController.RerollTaskVersion)
		r.Put("/{taskId}/rollback/{subtaskId}", taskController.RerollSubtaskVersion)

		// DELETE routes
		r.Delete("/{taskId}", taskController.DeleteTaskById)
		r.Delete("/{taskId}/subtasks/{subtaskId}", taskController.DeleteSubtaskById)
		r.Delete("/{taskId}/responses/{responseId}", taskController.DeleteResponseById)
	})
}
