package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/task-service/interfaces"
	"github.com/horatiucrisan/task-service/model"
)

type taskService struct {
	taskRepository interfaces.TaskRepository
}

func NewTaskService(taskRepository interfaces.TaskRepository) interfaces.TaskService {
	return &taskService{taskRepository: taskRepository}
}

// CreateTask retrieves the data from the controller layer and creates a new Task object and sends it to the repository layer
// to create a new Task document
//
// Parameters:
//   - ctx: Request-scoped context
//   - authorId: The ID of the user that sent the request
//   - projectId: The ID of the project in which the Task is stored
//   - handlerIds: The list of users that are assigned that task
//   - description: The description of the task
//   - deadline: The due timestamp of the task
//
// Returns:
//   - model.Task: The created task object
//   - error: An error that happend during the creation of the task
func (s *taskService) CreateTask(ctx context.Context, authorId string, projectId string, handlerIds []string, description string, deadline int64) (model.Task, error) {
	// Generate an ID for the task using uuid
	taskId := uuid.NewString()

	// Get the current time of the task creation
	now := time.Now().Unix()

	taskData := model.Task{
		ID:          taskId,
		AuthorID:    authorId,
		ProjectID:   projectId,
		HandlerIDs:  handlerIds,
		Description: description,
		Deadline:    deadline,
		CreatedAt:   now,
		CompletedAt: nil,
		Status:      "new",
	}

	// Send the data to the service layer to create the task
	task, err := s.taskRepository.CreateTask(ctx, taskData)

	// If there was an error while creating the task return the error
	if err != nil {
		return model.Task{}, err
	}

	// Return the created task
	return task, nil
}

// CreateSubtask retrieves the data from the controller layer and creates a new Subtask object and sends it to the repository layer
// to create a new Subtask for a Task
//
// Parameters:
//   - ctx: Request-scoped context
//   - authorId: The ID of the user that sent the request
//   - projectId: The ID of the project in which the Task is stored
//   - taskId: The ID of the task, the subtask is part of
//   - handlerId: The user that the subtask is assigned to
//   - description: The description of the subtask
//
// Returns:
//   - model.Subtask: The created subtask object
//   - error: An error that happend during the creation of the subtask
func (s *taskService) CreateSubtask(ctx context.Context, authorId string, taskId string, handlerId string, description string) (model.Subtask, error) {
	// Generate the ID of the subtask using uuid
	subtaskId := uuid.NewString()

	// Get the current creation timestamp
	now := time.Now().Unix()

	// Create the subtask object
	subtaskData := model.Subtask{
		ID:          subtaskId,
		TaskID:      taskId,
		AuthorID:    authorId,
		HandlerID:   handlerId,
		Description: description,
		CreatedAt:   now,
		Done:        false,
	}

	// Send the data to the repository layer to create the subtask document
	subtask, err := s.taskRepository.CreateSubtask(ctx, taskId, subtaskData)

	// If there was an error while creating the subtask return the error
	if err != nil {
		return model.Subtask{}, err
	}

	// Return the subtask document data
	return subtask, nil
}

func (s *taskService) CreateTaskResponse(ctx context.Context, authorId string, taskId string, message string) (model.Response, error) {
	responseId := uuid.NewString()
	now := time.Now().Unix()

	responseData := model.Response{
		ID:        responseId,
		AuthorID:  authorId,
		TaskID:    taskId,
		Timestamp: now,
		Message:   message,
	}

	response, err := s.taskRepository.CreateTaskResponse(ctx, taskId, responseData)
	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}

func (s *taskService) GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter *string) ([]model.Task, error) {
	tasks, err := s.taskRepository.GetTasks(ctx, projectId, limit, orderBy, orderDirection, startAfter)
	if err != nil {
		return nil, err
	}

	return tasks, nil
}

func (s *taskService) GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error) {
	subtasks, err := s.taskRepository.GetSubtasks(ctx, taskId)
	if err != nil {
		return nil, err
	}

	return subtasks, nil
}

func (s *taskService) GetResponses(ctx context.Context, taskId string) ([]model.Response, error) {
	responses, err := s.taskRepository.GetResponses(ctx, taskId)
	if err != nil {
		return nil, err
	}

	return responses, nil
}

func (s *taskService) GetTaskById(ctx context.Context, taskId string) (model.Task, error) {
	task, err := s.taskRepository.GetTaskById(ctx, taskId)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (s *taskService) UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error) {
	task, err := s.taskRepository.UpdateTaskDescription(ctx, taskId, description)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (s *taskService) UpdateTaskStatus(ctx context.Context, taskId string, status string) (model.Task, error) {
	task, err := s.taskRepository.UpdateTaskStatus(ctx, taskId, status)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (s *taskService) AddTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	task, err := s.taskRepository.AddTaskHandlers(ctx, taskId, handlerIds)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (s *taskService) RemoveTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	task, err := s.taskRepository.RemoveTaskHandlers(ctx, taskId, handlerIds)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (s *taskService) UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error) {
	subtask, err := s.taskRepository.UpdateSubtaskDescription(ctx, taskId, subtaskId, description)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (s *taskService) UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error) {
	subtask, err := s.taskRepository.UpdateSubtaskHandler(ctx, taskId, subtaskId, handlerId)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (s *taskService) UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, status bool) (model.Subtask, error) {
	subtask, err := s.taskRepository.UpdateSubtaskStatus(ctx, taskId, subtaskId, status)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (s *taskService) UpdateResponseMessage(ctx context.Context, taskId string, responseId string, message string) (model.Response, error) {
	response, err := s.taskRepository.UpdateResponseMessage(ctx, taskId, responseId, message)
	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}

func (s *taskService) DeleteTaskById(ctx context.Context, taskId string) (string, error) {
	success, err := s.taskRepository.DeleteTaskById(ctx, taskId)
	if err != nil {
		return "", err
	}

	return success, nil
}

func (s *taskService) DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (string, error) {
	success, err := s.taskRepository.DeleteSubtaskById(ctx, taskId, subtaskId)
	if err != nil {
		return "", err
	}

	return success, nil
}

func (s *taskService) DeleteResponseById(ctx context.Context, taskId string, responseId string) (string, error) {
	success, err := s.taskRepository.DeleteResponseById(ctx, taskId, responseId)
	if err != nil {
		return "", err
	}

	return success, nil
}
