package rabbitmq

import (
	"github.com/horatiucrisan/task-service/model"

	"golang.org/x/exp/slices"
)

// CheckSubtaskHandler checks if the two handlers of a subtask are different and retrieves the data of the from the user producer
//
// Parameters:
//   - currentHandler: The handler of the latest subtask version
//   - oldHandler: The handler of the previous subtask version that is rolled back
//   - userProducer: The rabbitMq user producer
//
// Returns:
//   - *model.User: The data of the current subtask handler
//   - *model.User: The data of the old subtask version handler
//   - error: An error that occured during the process
func CheckSubtaskHandler(currentHandler, oldHandler string, userProducer UserProducer) (*model.User, *model.User, error) {
	// Check if the current handler is different from the older handler
	if currentHandler != oldHandler {
		// Get the data of the current handler from the user producer
		currentUsers, err := userProducer.GetUsers([]string{currentHandler})
		if err != nil {
			return nil, nil, err
		}

		// Get the data of the old handler from the user producer
		oldUsers, err := userProducer.GetUsers([]string{oldHandler})
		if err != nil {
			return nil, nil, err
		}

		// Return the data of the handlers
		return &currentUsers[0], &oldUsers[0], nil
	}

	// Return nil if the handlers are the same
	return nil, nil, nil
}

// CheckTaskHandlers checks if the current handler list of the task is different from the old one that has been rolled back
//
// Parameters:
//   - currentHandlers: The list of current task handler IDs
//   - oldHandlers: The list of old task handler IDs
//   - userProducer: The rabbitMq user producer
//
// Returns:
//   - []model.User: The list of removed handlers data (handlers that were removed by rolling back)
//   - []model.User: The list of added handlers data (handlers that were in the roll back version but not in the current one)
//   - error: An error that occured during the process
func CheckTaskHandlers(currentHandlers, oldHandlers []string, userProducer UserProducer) ([]model.User, []model.User, error) {
	var removedHandlers []string
	var addedHandlers []string

	var removedUsers []model.User
	var addedUsers []model.User

	// Iterate over the current handlers of the task and check if any of them are not found in the rolled back handlers list
	for _, currentHandler := range currentHandlers {
		if !slices.Contains(oldHandlers, currentHandler) {
			// If the user was not found in both lists, add the user to the removed handlers list
			removedHandlers = append(removedHandlers, currentHandler)
		}
	}

	// Iterate over the old handlers list (rolled back version) and check if they are not found in the current task handlers list
	for _, oldHandler := range oldHandlers {
		if !slices.Contains(currentHandlers, oldHandler) {
			// If the user was not found in both lists, add the user to the added handlers list
			addedHandlers = append(addedHandlers, oldHandler)
		}
	}

	// If the removed handlers list is not empty, get the data of each user from the user producer
	if len(removedHandlers) != 0 {
		removedHandlersData, err := userProducer.GetUsers(removedHandlers)
		if err != nil {
			return nil, nil, err
		}

		// Add the user data to the removed users list
		removedUsers = append(removedUsers, removedHandlersData...)
	}

	// If the added handlers list is not empty, get the data of each user from the user producer
	if len(addedHandlers) != 0 {
		addedHandlersData, err := userProducer.GetUsers(addedHandlers)
		if err != nil {
			return nil, nil, err
		}

		// Add the user data to the added users list
		addedUsers = append(addedUsers, addedHandlersData...)
	}

	return removedUsers, addedUsers, nil
}
