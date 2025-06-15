package repository

import (
	"context"
	"fmt"
	"sync"

	"golang.org/x/exp/slices"

	firestore "cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
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

// CreateTask retrieves the data from the service layer and adds a new task into the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - task: The task object
//
// Returns:
//   - model.Task: The created task data
//   - error: An error that occured during the process
func (r *taskRepository) CreateTask(ctx context.Context, task model.Task) (model.Task, error) {
	// Add the new task object into the tasks collection using the ID of the task object
	_, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(task.ID).Create(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// CreateSubtask retrieves the data from the service layer and adds a new subtask for a task into the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtask: The subtask object
//
// Returns:
//   - model.Subtask: The created subtask data
//   - error: An error that occured during the process
func (r *taskRepository) CreateSubtask(ctx context.Context, taskId string, subtask model.Subtask) (model.Subtask, error) {
	// Run a transaction before creating the subtask in order to prevent task updating errors
	err := r.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Get the parent task reference
		taskRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

		// Get the subtask parent reference
		subtaskRef := taskRef.Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtask.ID)

		// Create the subtask
		if err := tx.Create(subtaskRef, subtask); err != nil {
			return fmt.Errorf("failed to create subtask: %w", err)
		}

		// Increment the subtaskCount in the parent task
		if err := tx.Update(taskRef, []firestore.Update{
			{Path: "subtaskCount", Value: firestore.Increment(1)},
		}); err != nil {
			return fmt.Errorf("failed to increment subtask counter: %w", err)
		}

		return nil
	})
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// CreateTaskResponse retrieves the data from the service layer and adds a new task response into the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - response: The response object
//
// Returns:
//   - model.Response: The created resopnse data
//   - error: An error that occured during the process
func (r *taskRepository) CreateTaskResponse(ctx context.Context, taskId string, response model.Response) (model.Response, error) {
	err := r.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Get parent task reference
		taskRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

		// Get subcollection doc reference for response
		responseRef := taskRef.Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(response.ID)

		// Create response in subcollection
		if err := tx.Create(responseRef, response); err != nil {
			return fmt.Errorf("failed to create response: %w", err)
		}

		// Increment response count on the parent task document
		if err := tx.Update(taskRef, []firestore.Update{
			{Path: "responseCount", Value: firestore.Increment(1)},
		}); err != nil {
			return fmt.Errorf("failed to increment responseCount on task: %w", err)
		}

		return nil
	})

	if err != nil {
		return model.Response{}, err
	}

	return response, nil
}

// GetTasks retrieves the data from the service layer and returns a list of tasks
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project that the tasks are part of
//   - limit: The number of tasks to retrieve
//   - orderBy: The order criteria
//   - orderDirection: The direction of the order
//   - *startAfter: The ID of the last task retrieved at the previous fetching request
//
// Returns:
//   - []model.Task: The list of retrieved tasks
//   - error: An error that occured during the process
func (r *taskRepository) GetTasks(ctx context.Context, projectId string, limit int, orderBy string, orderDirection string, startAfter string) ([]model.Task, error) {
	// Get the tasks that are part of the project
	query := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Where("projectId", "==", projectId)

	// Check the order direction and query based on it
	if orderDirection == "asc" {
		query = query.OrderBy(orderBy, firestore.Asc)
	} else {
		query = query.OrderBy(orderBy, firestore.Desc)
	}

	//Check if the ID of the last task was sent as a parameter
	if startAfter != "" && len(startAfter) == 0 && startAfter != "null" {
		lastDocSnapshot, err := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(startAfter).Get(ctx)
		if err != nil {
			return nil, err
		}

		query = query.StartAfter(lastDocSnapshot.Data()[orderBy])
	}

	// Limit the number of tasks to retrieve
	query = query.Limit(limit)

	// Get the tasks snapshots
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	// Iterate over the snapshots
	tasks := []model.Task{}
	for _, doc := range docs {
		var task model.Task

		// Add the data of each snapshot to the tasks list
		err := doc.DataTo(&task)
		if err != nil {
			return nil, err
		}

		tasks = append(tasks, task)
	}

	return tasks, nil
}

// GetTaskById retrieves the data from the service layer and returns the data of the task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//
// Returns:
//   - model.Task: The data of the task
//   - error: An error that occured during the process
func (r *taskRepository) GetTaskById(ctx context.Context, taskId string) (model.Task, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Check if the snapshot exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	// Add the snapshot data to the task object
	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, nil
	}

	return task, nil
}

// GetSubtasks retrieves the data from the service layer and returns the list of subtasks of a task
//
// Parameteres:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//
// Returns:
//   - []model.Subtask: The list of task subtasks
//   - error: An error that occured during the process
func (r *taskRepository) GetSubtasks(ctx context.Context, taskId string) ([]model.Subtask, error) {
	// Get the references of the subtasks documents
	docRefs := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION)

	// Get the document snapshots
	docSnapshots, err := docRefs.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	// Iterate over the document snapshots
	var subtasks []model.Subtask
	for _, doc := range docSnapshots {
		var subtask model.Subtask

		// Add the snapshot data of each document to the subtask object
		err := doc.DataTo(&subtask)
		if err != nil {
			return nil, err
		}

		subtasks = append(subtasks, subtask)
	}

	return subtasks, nil
}

// GetSubtaskById retrieves the data from the service layer and returns the data of the subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//
// Returns:
//   - model.Subtask: The data of the subtask
//   - error: An error that occured during the process
func (r *taskRepository) GetSubtaskById(ctx context.Context, taskId, subtaskId string) (model.Subtask, error) {
	// Get the subtask document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		// Check if the subtask exists
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("Subtask with ID `%s` not found", subtaskId)
		}

		return model.Subtask{}, err
	}

	// Add the snapshot data to the subtask object
	var subtask model.Subtask
	if err = docSnapshot.DataTo(&subtask); err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// GetResponses retrieves the data from the service layer and returns the list of task responses
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task for which to retrieve the responses
//
// Returns:
//   - []model.Response: The list of task responses
//   - error: An error that occured during the process
func (r *taskRepository) GetResponses(ctx context.Context, taskId string) ([]model.Response, error) {
	// Get the document references for each response
	docRefs := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION)

	// Get the snapshot for each document
	docSnapshots, err := docRefs.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	// Iterate over each document snapshot
	var responses []model.Response
	for _, doc := range docSnapshots {
		var response model.Response

		// Add the data of each snapshot to a reponse document
		err := doc.DataTo(&response)
		if err != nil {
			return nil, err
		}

		responses = append(responses, response)
	}

	return responses, nil
}

// GetResponseById retrieves the data from the service layer and returns the data of the response
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - responseId: The ID of the response
//
// Returns:
//   - model.Response: The data of the response
//   - error: An error that occured during the process
func (r *taskRepository) GetResponseById(ctx context.Context, taskId, responseId string) (model.Response, error) {
	// Get the response document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(responseId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		// Check if the document exists
		if status.Code(err) == codes.NotFound {
			return model.Response{}, fmt.Errorf("response with ID `%s` not found", responseId)
		}

		return model.Response{}, err
	}

	// Add the document data into the response object
	var response model.Response
	if err = docSnapshot.DataTo(&response); err != nil {
		return model.Response{}, err
	}

	return response, nil
}

// UpdateTaskDescription retrieves the data from the service layer and updates the description of the task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task to update
//   - description: The new task description
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateTaskDescription(ctx context.Context, taskId string, description string) (model.Task, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snapshot and check if the document exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	// Add the snapshot data to the task object
	var task model.Task
	docSnapshot.DataTo(&task)

	// Update the description
	task.Description = description

	// Update the task data in the database
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// UpdateTaskStatus retrieves the data from the service layer and updates the status of the task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - taskStatus: The new task status
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateTaskStatus(ctx context.Context, taskId string, taskStatus string) (model.Task, error) {
	// Get the task document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
	}

	// Add the document snapshot data to the task object
	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, err
	}

	// Update the task status
	task.Status = taskStatus

	// Update the task inside the database
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// AddTaskHandlers retrieves data from the service layer and adds new handlers to a project task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task to update
//   - handlerIds: The list of new handler IDs
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (r *taskRepository) AddTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	// Get the task document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snpashot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	// Add the data from the snapshot to the task object
	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, err
	}

	// Add the new handlers to the task handlers
	task.HandlerIDs = append(task.HandlerIDs, handlerIds...)

	// Update the task data into the database
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// RemoveTaskHandlers retrieves the data from the service layer and removes handlers from a task handler list
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task to update
//   - handlerIds: The list of handler IDs to remove
//
// Returns:
//   - model.Task: The updated task data
//   - error: An error that occured during the process
func (r *taskRepository) RemoveTaskHandlers(ctx context.Context, taskId string, handlerIds []string) (model.Task, error) {
	// Get the task document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	// Add the snapshot data to the task object
	var task model.Task
	err = docSnapshot.DataTo(&task)
	if err != nil {
		return model.Task{}, err
	}

	// Iterate over the task handlers and check if the list contains the handlers to remove and remove them
	var filteredHnalderIds []string
	for _, taskHandler := range task.HandlerIDs {
		if slices.Contains(handlerIds, taskHandler) == false {
			filteredHnalderIds = append(filteredHnalderIds, taskHandler)
		}
	}

	// Update the task handlers list
	task.HandlerIDs = filteredHnalderIds

	// Update the task data into the database
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// UpdateSubtaskDescription retrieves the data from the service layer and uptates the description of the subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The subtask ID
//   - description: The new subtask description
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateSubtaskDescription(ctx context.Context, taskId string, subtaskId string, description string) (model.Subtask, error) {
	// Get the subtask document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
		}
		return model.Subtask{}, err
	}

	// Add the snapshot data to the subtask object
	var subtask model.Subtask
	err = docSnapshot.DataTo(&subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	// Update the subtask description
	subtask.Description = description

	// Update the subtask data into the database
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// UpdateSubtaskHandler retrieves the data from the service layer and updates the handler of the subtask
//
// Parameters:
//   - ctx: Reqeust-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The subtask ID
//   - handlerId: The new subtask handler ID
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateSubtaskHandler(ctx context.Context, taskId string, subtaskId string, handlerId string) (model.Subtask, error) {
	// Get the subtask document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
		}
		return model.Subtask{}, err
	}

	// Add the snapshot data to the subtask object
	var subtask model.Subtask
	err = docSnapshot.DataTo(&subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	// Update the subtask handler
	subtask.HandlerID = handlerId

	// Update the subtask data into the database
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, nil
}

// UpdateSubtaskStatus retrieves the data from the service layer and updates the status of the subtask
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task that the subtask is part of
//   - subtaskId: The subtask ID
//   - subtaskStatus: The new subtask status
//
// Returns:
//   - model.Subtask: The updated subtask data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateSubtaskStatus(ctx context.Context, taskId string, subtaskId string, subtaskStatus bool) (model.Subtask, error) {
	// Get the task document reference
	taskRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the subtask document reference
	subtaskRef := taskRef.Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	var updatedSubtask model.Subtask

	// Run a transaction to avoid race conditions
	err := r.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Get the subtask snapshot
		subtaskSnapshot, err := tx.Get(subtaskRef)
		if err != nil {
			if status.Code(err) == codes.NotFound {
				return fmt.Errorf("subtask with the ID %s for the task with the ID %s not found", subtaskId, taskId)
			}
			return err
		}

		// Parse existing subtask data
		var subtask model.Subtask
		if err := subtaskSnapshot.DataTo(&subtask); err != nil {
			return err
		}

		// Only increment/decrement the counter if the value has actually changed
		if subtask.Done != subtaskStatus {
			counterDelta := int64(1)
			if !subtaskStatus {
				counterDelta = -1
			}

			// Update the parent task's completedSubtaskCount
			if err := tx.Update(taskRef, []firestore.Update{
				{Path: "completedSubtaskCount", Value: firestore.Increment(counterDelta)},
			}); err != nil {
				return fmt.Errorf("failed to update completedSubtaskCount in parent task: %w", err)
			}
		}

		// Update the subtask `done` status
		if err := tx.Update(subtaskRef, []firestore.Update{
			{Path: "done", Value: subtaskStatus},
		}); err != nil {
			return fmt.Errorf("failed to update subtask status: %w", err)
		}

		// Return the updated subtask
		subtask.Done = subtaskStatus
		updatedSubtask = subtask

		return nil
	})
	if err != nil {
		return model.Subtask{}, err
	}

	return updatedSubtask, nil
}

// UpdateResponseMessage retrieves the data from the service layer and updates the text message of a task response
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - responseId: The ID of the resmpose
//
// Returns:
//   - model.Response: The updated response data
//   - error: An error that occured during the process
func (r *taskRepository) UpdateResponseMessage(ctx context.Context, taskId string, responseId, message string) (model.Response, error) {
	// Get the response document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(responseId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Response{}, fmt.Errorf("response with ID %s not found. Failed to update response message", responseId)
		}
		return model.Response{}, err
	}

	// Add the snapshot data to the response object
	var response model.Response
	if err = docSnapshot.DataTo(&response); err != nil {
		return model.Response{}, err
	}

	// update the response text message
	response.Message = message

	// Update the reponse object into the database
	_, err = docRef.Set(ctx, response)
	if err != nil {
		return model.Response{}, nil
	}

	return response, nil

}

// RerollTaskVersion retrieves the data from the service layer and updates the data of a task to an older version
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task
//   - task: An old task version
//
// Returns:
//   - model.Task: The updated task version
//   - error: An error that occured during the process
func (r *taskRepository) RerollTaskVersion(ctx context.Context, taskId string, task model.Task) (model.Task, error) {
	// Get the task document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snapshot
	_, err := docRef.Get(ctx)
	if err != nil {
		// Check if the document exists
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID `%s` not found", taskId)
		}
		return model.Task{}, err
	}

	// Reroll the task version to a previous one
	_, err = docRef.Set(ctx, task)
	if err != nil {
		return model.Task{}, err
	}

	return task, nil
}

// RerollSubtaskVersion retrieves the data from the service layer and updates a subtask of a task to an older version
//
// Parameters:
//   - ctx: Reqeust-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//   - subtask: The old subtask version
//
// Returns:
//   - model.Subtask: The updated subtask version
//   - error: An error that occured during the process
func (r *taskRepository) RerollSubtaskVersion(ctx context.Context, taskId, subtaskId string, subtask model.Subtask) (model.Subtask, error) {
	// Get the subtask document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	// Get the document snapshot
	_, err := docRef.Get(ctx)
	if err != nil {
		// Check if the subtask exists
		if status.Code(err) == codes.NotFound {
			return model.Subtask{}, fmt.Errorf("subtask with ID `%s` not found", subtaskId)
		}
		return model.Subtask{}, err
	}

	// Reroll the subtask version
	_, err = docRef.Set(ctx, subtask)
	if err != nil {
		return model.Subtask{}, err
	}

	return subtask, err
}

// DeleteTaskById retrieves the data from the service layer and deletes the task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task to delete
//
// Returns:
//   - model.Task: The data of the deleted task
//   - error: An error that occured during the process
func (r *taskRepository) DeleteTaskById(ctx context.Context, taskId string) (model.Task, error) {
	// Get the task document reference
	docRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)

	// Get the document snapshot
	docSnapshot, err := docRef.Get(ctx)

	// Check if the document exists
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Task{}, fmt.Errorf("task with ID %s not found", taskId)
		}
		return model.Task{}, err
	}

	// Add the snapshot data to the task object
	var task model.Task
	if err = docSnapshot.DataTo(&task); err != nil {
		return model.Task{}, err
	}

	// Delete the task from the database
	docRef.Delete(ctx)

	return task, nil
}

// DeleteSubtaskById retrieves the data from the service layer and deletes a subtask of a task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the subtask is part of
//   - subtaskId: The ID of the subtask
//
// Returns:
//   - model.Subtask: The data of the deleted subtask
//   - error: An error that occured during the process
func (r *taskRepository) DeleteSubtaskById(ctx context.Context, taskId string, subtaskId string) (model.Subtask, error) {
	// Get the task reference
	taskRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)
	// Get the subtask document reference
	subtaskRef := taskRef.Collection(utils.EnvInstances.TASKS_SUBCOLLECTION).Doc(subtaskId)

	var deletedSubtask model.Subtask

	// Run a transaction to avoid errors while updating the parent task
	err := r.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Get the subtask snapshot
		subtaskSnapshot, err := tx.Get(subtaskRef)
		if err != nil {
			// Check if the subtask was not found
			if status.Code(err) == codes.NotFound {
				return fmt.Errorf("subtask with ID %s not found", subtaskId)
			}

			return err
		}

		// Add the subtask data to the variable in order to return it
		if err := subtaskSnapshot.DataTo(&deletedSubtask); err != nil {
			return err
		}

		// Delete the subtask
		tx.Delete(subtaskRef)

		// Decrement subtask counter
		updates := []firestore.Update{
			{Path: "subtaskCount", Value: firestore.Increment(-1)},
		}

		// If the subtask is complete, decrement the complete subtasks counter
		if deletedSubtask.Done == true {
			updates = append(updates, firestore.Update{
				Path:  "completedSubtaskCount",
				Value: firestore.Increment(-1),
			})
		}

		// Apply the counter updates on the parent task
		return tx.Update(taskRef, updates)
	})
	if err != nil {
		return model.Subtask{}, err
	}

	return deletedSubtask, nil
}

// DeleteResopnseById retrieves the data from the service layer and deletes the task resposne
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the task the response is part of
//   - responseId: The ID of the task response
//
// Returns:
//   - model.Response: The data of the deleted response
//   - error: An error that occured during the process
func (r *taskRepository) DeleteResponseById(ctx context.Context, taskId, responseId string) (model.Response, error) {
	// Get the task reference
	taskRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId)
	// Get the response document reference
	responseRef := taskRef.Collection(utils.EnvInstances.RESPONSES_COLLECTION).Doc(responseId)

	var deletedResponse model.Response

	// Run a transaction to avoid update errors in the parent task
	err := r.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		reponseSnapshot, err := tx.Get(responseRef)
		if err != nil {
			// Check if the response was not found
			if status.Code(err) == codes.NotFound {
				return fmt.Errorf("response with ID %s not found", responseId)
			}
			return err
		}

		// Add the data of the resposne to the variable to return it
		if err := reponseSnapshot.DataTo(&deletedResponse); err != nil {
			return err
		}

		// Delte the response
		tx.Delete(responseRef)

		// Decremetn the task resposne counter
		updates := []firestore.Update{
			{Path: "responseCount", Value: firestore.Increment(-1)},
		}

		// Apply the counter updates to the parent task
		return tx.Update(taskRef, updates)
	})
	if err != nil {
		return model.Response{}, err
	}

	return deletedResponse, nil
}

// DeleteTaskSubcollections retrieves the data from the service layer
// and deletes the responses and the subtasks of a deleted task
//
// Parameters:
//   - ctx: Request-scoped context
//   - taskId: The ID of the deleted task
//
// Returns:
//   - string: The success message
//   - error: An error that occured during the process
func (r *taskRepository) DeleteTaskSubcollections(ctx context.Context, taskId string, batchSize int) (string, error) {
	// Generate a new wait group for both subcollections to be deleted
	var wg sync.WaitGroup

	// Generate a new channel that recieves two error messages
	errChan := make(chan error, 2)

	// Generate a new function in order to delete both subcollections using multi-threads
	deleteCollection := func(colRef *firestore.CollectionRef) {
		defer wg.Done()

		// Generate a new bulk writer that will delete the documents
		bulkWriter := r.client.BulkWriter(ctx)

		// Iterate over each collection and retrieve a `limit` number of documents at a time
		for {
			iter := colRef.Limit(batchSize).Documents(ctx)
			numDeleted := 0

			// For each list of documentes iterate and perform the deletion operation
			for {
				// Get the next document
				doc, err := iter.Next()

				// Check if the iterator reach the last element
				if err == iterator.Done {
					break
				}

				// If an error occured, add it to the error channel
				if err != nil {
					errChan <- err
					return
				}

				// Delete the document reference and increment the number of documents deleted
				bulkWriter.Delete(doc.Ref)
				numDeleted++
			}

			// If there were no documents deleted, end the process
			if numDeleted == 0 {
				bulkWriter.End()
				break
			}

			// Commit all the processes
			bulkWriter.Flush()
		}
	}

	// Get the subtasks collection reference
	subtasksRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.TASKS_SUBCOLLECTION)
	responsesRef := r.client.Collection(utils.EnvInstances.TASKS_COLLECTION).Doc(taskId).Collection(utils.EnvInstances.RESPONSES_COLLECTION)

	// Add each process
	wg.Add(2)
	go deleteCollection(subtasksRef)
	go deleteCollection(responsesRef)

	// Wait for each process to finish the execution
	wg.Wait()

	// Close the error channel
	close(errChan)

	// Iterate over the error channel and check if there is an error
	for err := range errChan {
		if err != nil {
			return "", err
		}
	}

	return "OK", nil
}
