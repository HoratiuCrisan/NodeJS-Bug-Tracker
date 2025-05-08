package interfaces

import (
	"context"

	"github.com/horatiucrisan/task-service/model"
)

type TaskService interface {
	CreateTask(ctx context.Context, authorId string, projectId string, handlerIds []string, description string, deadline int64) (model.Task, error)
	CreateSubtask(ctx context.Context, authorId string, taskId string, handlerId string, description string) (model.Subtask, error)
	CreateTaskResponse(ctx context.Context, authorId string, taskId string, message string) (model.Response, error)

	GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter *string) ([]model.Task, error)
	GetTaskById(ctx context.Context, taskId string) (model.Task, error)
	GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error)
	GetResponses(ctx context.Context, taskId string) ([]model.Response, error)

	UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error)
	UpdateTaskStatus(ctx context.Context, taskId string, status string) (model.Task, error)
	UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error)
	UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error)
	UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, status bool) (model.Subtask, error)
	AddTaskHandlers(ctx context.Context, taskId string, handlers []string) (model.Task, error)
	RemoveTaskHandlers(ctx context.Context, taskId string, handlers []string) (model.Task, error)
	UpdateResponseMessage(ctx context.Context, taskId string, responseId string, message string) (model.Response, error)

	DeleteTaskById(ctx context.Context, taskId string) (model.Task, error)
	DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (model.Subtask, error)
	DeleteResponseById(ctx context.Context, taskId string, responseId string) (model.Response, error)
}
