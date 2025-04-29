package repository

import (
	"context"
	"fmt"

	"golang.org/x/exp/slices"

	firestore "cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/horatiucrisan/task-service/interfaces"
	"github.com/horatiucrisan/task-service/model"
	"github.com/horatiucrisan/task-service/utils"
)

type taskRepository struct {
	client *firestore.Client
}

func NewTaskRepository(client *firestore.Client) interfaces.TaskRepository {
	return &taskRepository{client: client}
}

func (r *taskRepository) CreateTask(ctx context.Context, task model.Task) (model.Task, error) {
	_, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(task.ID).Create(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (r *taskRepository) CreateSubtask(ctx context.Context, taskId string, subtask model.Subtask) (model.Subtask, error) {
	_, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtask.ID).Create(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (r *taskRepository) CreateTaskResponse(ctx context.Context, taskId string, response model.Response) (model.Response, error) {
	_, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(response.ID).Create(ctx, response)
	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}

func (r *taskRepository) GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter *string) ([]model.Task, error) {
	query := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Where("projectId", "==", projectId)

	if orderDirection == "asc" {
		query = query.OrderBy(orderBy, firestore.Asc)
	} else {
		query = query.OrderBy(orderBy, firestore.Desc)
	}

	if startAfter != nil && *startAfter != "" {
		lastDocSnapshot, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(*startAfter).Get(ctx)
		if err != nil {
			return nil, err
		}

		query = query.StartAfter(lastDocSnapshot.Data()[orderBy])
	}

	query = query.Limit(limit)

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	tasks := []model.Task{}
	for _, doc := range docs {
		var task model.Task

		err := doc.DataTo(&task)
		if err != nil {
			return nil, err
		}

		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (r *taskRepository) GetTaskById(ctx context.Context, taskId string) (model.Task, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, nil
	}

	return task, nil
}

func (r *taskRepository) GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error) {
	docRefs := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION)

	docSnapshots, err := docRefs.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	var subtasks []model.Subtask
	for _, doc := range docSnapshots {
		var subtask model.Subtask

		err := doc.DataTo(&subtask)
		if err != nil {
			return nil, err
		}

		subtasks = append(subtasks, subtask)
	}

	return subtasks, nil
}

func (r *taskRepository) GetResponses(ctx context.Context, taskId string) ([]model.Response, error) {
	docRefs := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION)

	docSnapshots, err := docRefs.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	var responses []model.Response
	for _, doc := range docSnapshots {
		var response model.Response

		err := doc.DataTo(&response)
		if err != nil {
			return nil, err
		}

		responses = append(responses, response)
	}

	return responses, nil
}

func (r *taskRepository) UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	var task model.Task
	docSnapshot.DataTo(&task)

	task.Description = description

	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (r *taskRepository) UpdateTaskStatus(ctx context.Context, taskId string, taskStatus string) (model.Task, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
	}

	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, err
	}

	task.Status = taskStatus

	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (r *taskRepository) AddTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	var task model.Task
	err = docSnapshot.DataTo(&task)

	if err != nil {
		return model.Task{}, err
	}

	task.HandlerIDs = append(task.HandlerIDs, handlerIds...)
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (r *taskRepository) RemoveTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, err
	}

	var filteredHnalderIds []string
	for _, taskHandler := range task.HandlerIDs {
		if slices.Contains(handlerIds, taskHandler) == false {
			filteredHnalderIds = append(filteredHnalderIds, taskHandler)
		}
	}

	task.HandlerIDs = filteredHnalderIds

	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

func (r *taskRepository) UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
		}
		return model.Subtask{}, err
	}

	var subtask model.Subtask
	err = docSnapshot.DataTo(&subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	subtask.Description = description
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (r *taskRepository) UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
		}
		return model.Subtask{}, err
	}

	var subtask model.Subtask
	err = docSnapshot.DataTo(&subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	subtask.HandlerID = handlerId
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (r *taskRepository) UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, subtaskStatus bool) (model.Subtask, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
		}
		return model.Subtask{}, err
	}

	var subtask model.Subtask
	err = docSnapshot.DataTo(&subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	subtask.Done = subtaskStatus
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

func (r *taskRepository) UpdateResponseMessage(ctx context.Context, taskId string, messageId string, message string) (model.Response, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Response{}, fmt.Errorf("response with ID %s not found. Failed to update response message", messageId)
		}
		return model.Response{}, err
	}

	var response model.Response
	if err = docSnapshot.DataTo(&response); err != nil {
		return model.Response{}, err
	}

	response.Message = message

	_, err = docRef.Set(ctx, response)
	if err != nil {
		return model.Response{}, nil
	}

	return response, nil

}

func (r *taskRepository) DeleteTaskById(ctx context.Context, taskId string) (string, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	_, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return "", fmt.Errorf("task with ID %s not found", taskId)
		}
		return "", err
	}

	docRef.Delete(ctx)

	return "OK", nil
}

func (r *taskRepository) DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (string, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	_, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return "", fmt.Errorf("subticket with ID %s for the ticket with ID %s not found", subtaskId, taskId)
		}
		return "", err
	}

	docRef.Delete(ctx)

	return "OK", nil
}

func (r *taskRepository) DeleteResponseById(ctx context.Context, taskId string, responseId string) (string, error) {
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(responseId)

	_, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return "", fmt.Errorf("response with ID %s not found", responseId)
		}

		return "", err
	}

	docRef.Delete(ctx)

	return "OK", nil
}
