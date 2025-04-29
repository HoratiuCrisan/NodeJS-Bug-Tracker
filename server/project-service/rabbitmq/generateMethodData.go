package rabbitmq

import (
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/project-service/middleware"
	"github.com/horatiucrisan/project-service/model"
)

func GenerateLogData(w http.ResponseWriter, r *http.Request, logProducer *ProjectProducer, logMessage, logType string, httpCode int, duration time.Duration, data any) error {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		return err
	}

	logDetails := model.LogMessage{
		ID:        uuid.New().String(),
		Type:      logType,
		Timestamp: time.Now().Unix(),
		Message:   logMessage,
		RequestDetails: model.RequestDetails{
			Method:   r.Method,
			Endpoint: fmt.Sprintf("%s", r.URL),
			Status:   httpCode,
			Duration: duration,
		},
		User: model.User{
			ID:          user.UID,
			Email:       fmt.Sprintf("%s", user.Claims["email"]),
			Role:        fmt.Sprintf("%s", user.Claims["role"]),
			DisplayName: fmt.Sprintf("%s", user.Claims["name"]),
		},
		Data: data,
	}

	err = logProducer.SendMessage(logDetails)
	if err != nil {
		return err
	}

	return nil
}

func GenerateNotificationData(notificationProducer *ProjectProducer, users []model.NotificationUser, notificationType string, data any) error {
	for _, user := range users {
		notificationMessage := model.NotificationMessage{
			UserID:  user.UserID,
			Email:   &user.Email,
			Message: user.Message,
			Type:    notificationType,
			Data:    data,
		}

		err := notificationProducer.SendMessage(notificationMessage)
		if err != nil {
			return err
		}
	}

	return nil
}
