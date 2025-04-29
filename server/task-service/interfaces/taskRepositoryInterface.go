package interfaces

import (
	"context"

	"github.com/horatiucrisan/task-service/model"
)

type TaskRepository interface {
	CreateTask(ctx context.Context, task model.Task) (model.Task, error)
	CreateSubtask(ctx context.Context, taskId string, subtask model.Subtask) (model.Subtask, error)
	CreateTaskResponse(ctx context.Context, taskId string, response model.Response) (model.Response, error)

	GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter *string) ([]model.Task, error)
	GetTaskById(ctx context.Context, taskId string) (model.Task, error)
	GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error)
	GetResponses(ctx context.Context, taskId string) ([]model.Response, error)

	UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error)
	UpdateTaskStatus(ctx context.Context, taskId string, taskStatus string) (model.Task, error)
	AddTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error)
	RemoveTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error)
	UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error)
	UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error)
	UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, subtaskStatus bool) (model.Subtask, error)
	UpdateResponseMessage(ctx context.Context, taskId string, responseId string, message string) (model.Response, error)

	DeleteTaskById(ctx context.Context, taskId string) (string, error)
	DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (string, error)
	DeleteResponseById(ctx context.Context, taskId string, responseId string) (string, error)
}
