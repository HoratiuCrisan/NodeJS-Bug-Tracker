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
)

func NewRouter(userProducer *rabbitmq.UserProducer) (http.Handler, error) {
	r := chi.NewRouter()

	// Initialize firebase
	ctx := context.Background()
	firebaseClient, authClient, err := firebase.NewFirebaseClient(ctx)
	if err != nil {
		return nil, err
	}

	taskRepo := repository.NewTaskRepository(firebaseClient)
	taskService := service.NewTaskService(taskRepo)
	taskController := controller.NewTaskController(taskService, userProducer)

	taskRoutes(r, authClient, taskController)

	return r, nil
}

func taskRoutes(r chi.Router, authClient *auth.Client, taskController interfaces.TaskController) {
	r.Route("/api/tasks", func(r chi.Router) {
		r.Use(middleware.AuthMiddleware(authClient))

		r.Post("/", taskController.CreateTask)
		r.Post("/{taskId}", taskController.CreateSubtask)
		r.Post("/{taskId}/response", taskController.CreateTaskResponse)

		r.Get("/{projectId}", taskController.GetTasks)
		r.Get("/{projectId}/{taskId}", taskController.GetTaskById)
		r.Get("/{taskId}/subtasks", taskController.GetSubtasks)
		r.Get("/{taskId}/responses", taskController.GetResponses)

		r.Put("/{taskId}/description", taskController.UpdateTaskDescription)
		r.Put("/{taskId}/status", taskController.UpdateTaskStatus)
		r.Put("/{taskId}/addHandlers", taskController.AddTaskHandlers)
		r.Put("/{taskId}/removeHandlers", taskController.RemoveTaskHandlers)
		r.Put("/{taskId}/{subtaskId}/description", taskController.UpdateSubtaskDescription)
		r.Put("/{taskId}/{subtaskId}/handler", taskController.UpdateSubtaskHandler)
		r.Put("/{taskId}/{subtaskId}/status", taskController.UpdateSubtaskStatus)
		r.Put("/{taskId}/response/{responseId}", taskController.UpdateResponseMessage)

		r.Delete("/{taskId}", taskController.DeleteTaskById)
		r.Delete("/{taskId}/{subtaskId}", taskController.DeleteSubtaskById)
		r.Delete("/{taskId}/{responseId}", taskController.DeleteResponseById)
	})
}
