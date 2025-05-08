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

// CreateTaskResponse retrieves the data from the controller layer and sends it to the repository layer to create a new task response
//
// Parameters:
//   - ctx: Request-scoped context
//   - authorId: The ID of the user that sent the reqeust
//   - taskId: The ID of the task where the response is stored
//   - message: The textx message of the response
//
// Returns:
//   - model.Response: The response data
//   - error: An error that occured during the process
func (s *taskService) CreateTaskResponse(ctx context.Context, authorId string, taskId string, message string) (model.Response, error) {
	// Generate a new reponse ID using uuid
	responseId := uuid.NewString()

	// Get the current timestamp
	now := time.Now().Unix()

	// Generate the response object
	responseData := model.Response{
		ID:        responseId,
		AuthorID:  authorId,
		TaskID:    taskId,
		Timestamp: now,
		Message:   message,
	}

	// Send the data to the repository layer to create the response
	response, err := s.taskRepository.CreateTaskResponse(ctx, taskId, responseData)
	if err != nil {
		return model.Response{}, err
	}

	// Return the response data
	return response, nil
}

// GetTasks retrieves the data from the controller layer and retrieves the list of tasks from the repository layer
//
// Parameter:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project that the task is part of
//   - limit: The number of tasks to retrieve at a time
//   - orderBy: The ordering criteria
//   - orderDirection: The direction of the order
//   - *startAfter: The ID of the last task retrieved at the previous fetching request
//
// Returns:
//   - []model.Task: The list of retrieved tasks
//   - error: An error that occured during the process
func (s *taskService) GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter *string) ([]model.Task, error) {
	// Send the data to the repository layer to retrieve the tasks list
	tasks, err := s.taskRepository.GetTasks(ctx, projectId, limit, orderBy, orderDirection, startAfter)
	if err != nil {
		return nil, err
	}

	return tasks, nil
}

// GetSubtasks retrieves the data from the controller layer and returns a list of subtasks from the repository layer
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//
// Returns:
//   - []model.Subtask: The list of subtasks of a task
//   - error: An error that occured during the process
func (s *taskService) GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error) {
	// Send the data to the repository layer to retrieve the subtasks list
	subtasks, err := s.taskRepository.GetSubtasks(ctx, taskId)
	if err != nil {
		return nil, err
	}

	return subtasks, nil
}

// GetResponses retrieves the data from the controller layer and returns the list of responses from the repository layer
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the responses are part of
//
// Returns:
//   - []model.Response: The list of task responses
//   - error: An error that occured during the process
func (s *taskService) GetResponses(ctx context.Context, taskId string) ([]model.Response, error) {
	// Send the data to the repository layer to retrieve the list of responses
	responses, err := s.taskRepository.GetResponses(ctx, taskId)
	if err != nil {
		return nil, err
	}

	return responses, nil
}

// GetTaskById retrieves the data from the controller layer and retrieves the data of the task from the repository layer
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//
// Returns:
//   - model.Task: The data of the task
//   - error: An error that occured during the process
func (s *taskService) GetTaskById(ctx context.Context, taskId string) (model.Task, error) {
	// Send the data to the repository layer to retrieved the data of the task
	task, err := s.taskRepository.GetTaskById(ctx, taskId)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// UpdateTaskDescription retrieves the data from the controller layer and sends it to the repository layer to update the task description
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - description: The new task description
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (s *taskService) UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error) {
	task, err := s.taskRepository.UpdateTaskDescription(ctx, taskId, description)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// UpdateTaskStatus retrieves the data from the controller layer and sends it to the repository layer to update the status of the task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - status: The new task status
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (s *taskService) UpdateTaskStatus(ctx context.Context, taskId string, status string) (model.Task, error) {
	// Sends the data to the repository layer to update the status of the task
	task, err := s.taskRepository.UpdateTaskStatus(ctx, taskId, status)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// AddTaskHandler retrieves the data from the controller layer and sends it to the repository layer to add handlers to a task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - handlerIds: The list of handler IDs to add to the task
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (s *taskService) AddTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	// Send the data to the repository layer to add handlers
	task, err := s.taskRepository.AddTaskHandlers(ctx, taskId, handlerIds)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// RemoveTaskHandlers retrieves data from the controller layer and sends it to the repository layer to remove handlers from the list
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - handlerIds: The list of handler IDs to be removed from the task
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (s *taskService) RemoveTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	// Send the data to the repository layer to remove the task handlers
	task, err := s.taskRepository.RemoveTaskHandlers(ctx, taskId, handlerIds)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// UpdateSubtaskDescription retrieves the data from the controller layer and sends it to the repository layer
//
//	to update the description of the subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//   - description: The new subtask description
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (s *taskService) UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error) {
	// Send the data to the repository layer to update the description of the subtask
	subtask, err := s.taskRepository.UpdateSubtaskDescription(ctx, taskId, subtaskId, description)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// UpdateSubtaskHandler retrieves the data from the controller layer and sends it to the repository layer
// to set a new handler for a subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//   - handlerId: The ID of the new subtask handler
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (s *taskService) UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error) {
	// Send the data to the repository layer to update the subtask handler
	subtask, err := s.taskRepository.UpdateSubtaskHandler(ctx, taskId, subtaskId, handlerId)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// UpdateSubtaskStatus retrieves the data from the controller layer and sends it to the repository layer to update the subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//   - status: The new subtask status
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (s *taskService) UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, status bool) (model.Subtask, error) {
	// Send the data to the repository layer to update the subtask status
	subtask, err := s.taskRepository.UpdateSubtaskStatus(ctx, taskId, subtaskId, status)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// UpdateResponseMessage retrieves the data from the controller layer and sends it to the repository layer
// to update the response of a task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - responseId: The response ID
//   - message: The text message of the response
//
// Returns:
//   - model.Response: The udpated data of the response
//   - error: An error that occured during the process
func (s *taskService) UpdateResponseMessage(ctx context.Context, taskId string, responseId string, message string) (model.Response, error) {
	// Send the data to the repository layer to update the text message of the response
	response, err := s.taskRepository.UpdateResponseMessage(ctx, taskId, responseId, message)
	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}

// DeleteTaskById retrieves the data from the controller layer and sends it to the repository layer
// to delete a task, its subtasks and responses
//
// Paramters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//
// Returns:
//   - model.Task: The data of the deleted task
//   - error: An error that occured during the process
func (s *taskService) DeleteTaskById(ctx context.Context, taskId string) (model.Task, error) {
	// Send the data to the repository layer to delete the task
	task, err := s.taskRepository.DeleteTaskById(ctx, taskId)
	if err != nil {
		return model.Task{}, err
	}

	// Delete the subtasks and responses subcollections
	_, err = s.taskRepository.DeleteTaskSubcollections(ctx, taskId, 10)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// DeleteSubtaskById retrieves the data from the controller layer and sends it to the repository layer
// to delete a subtask of a task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//
// Returns:
//   - model.Subtask: The data of the deleted subtask
//   - error: An error that occured during the process
func (s *taskService) DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (model.Subtask, error) {
	// Send the data to the repository layer to delete the subtask
	subtask, err := s.taskRepository.DeleteSubtaskById(ctx, taskId, subtaskId)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// DeleteResponseById retrieves the data from the controller layer and sends it to the respository layer
// to delete a response from a task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - responseId: The ID of the response
//
// Returns:
//   - model.Response: The data of the deleted response
//   - error: An error that occured during the process
func (s *taskService) DeleteResponseById(ctx context.Context, taskId string, responseId string) (model.Response, error) {
	// Sned the data to the repository layer to delete the response of the task
	response, err := s.taskRepository.DeleteResponseById(ctx, taskId, responseId)
	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}
