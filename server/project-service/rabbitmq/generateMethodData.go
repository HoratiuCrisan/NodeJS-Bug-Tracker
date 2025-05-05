package rabbitmq

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/project-service/middleware"
	"github.com/horatiucrisan/project-service/model"
)

// GenerateLogData retrieves the log details from the controller layer and send the data to the rabbitMq producer
//
// Parameters:
//   - w: The response header of the method
//   - r: The method request
//   - logProducer: The rabbitMq log producer
//   - logMessage: The message
//   - logType: The type of log to be created
//   - httpCode: The status code of the method
//   - duration: The execution time of the method
//   - data: The method data to be stored with the log details
//
// Retruns:
//   - error: An error that occured during the process
func GenerateLogData(w http.ResponseWriter, r *http.Request, logProducer *ProjectProducer, logMessage, logType string, httpCode int, duration time.Duration, data any) error {
	// Retrieve the user data from the context
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		return err
	}

	// Generate the log details object
	logDetails := model.LogMessage{
		ID:        uuid.New().String(), // Generate an unique ID
		Type:      logType,
		Timestamp: time.Now().Unix(), // Set the current timestamp of the log creation
		Message:   logMessage,
		RequestDetails: model.RequestDetails{
			Method:   r.Method,                 // Set the request method
			Endpoint: fmt.Sprintf("%s", r.URL), // Set the request endpoint URL
			Status:   httpCode,
			Duration: duration,
		},
		// Set the data of the user that sent the request
		User: model.User{
			ID:          user.UID,
			Email:       fmt.Sprintf("%s", user.Claims["email"]),
			Role:        fmt.Sprintf("%s", user.Claims["role"]),
			DisplayName: fmt.Sprintf("%s", user.Claims["name"]),
		},
		Data: data,
	}

	// Send the message to the rabbitMq producer
	err = logProducer.SendMessage(logDetails)
	if err != nil {
		return err
	}

	return nil
}

// GenerateNotificationData retrieves the notification details from the controller layer and sends notifications to the rabbitMq producer
//
// Parameters:
//   - notificationProducer: The rabbitMq producer
//   - users: The list of users data an the specific user message
//   - notificationType: The type of notification (in-app | email)
//   - data: The data to send to the user with the notification
//
// Returns:
//   - error: An error that occured during the process
func GenerateNotificationData(notificationProducer *ProjectProducer, users []model.NotificationUser, notificationType string, data any) error {
	// Iterate over the users list and generate the notification message for each user
	for _, user := range users {
		notificationMessage := model.NotificationMessage{
			UserID:  user.UserID,
			Email:   &user.Email,
			Message: user.Message,
			Type:    notificationType,
			Data:    data,
		}

		// Send each notification message to the rabbitMq producer
		err := notificationProducer.SendMessage(notificationMessage)
		if err != nil {
			return err
		}
	}

	return nil
}
