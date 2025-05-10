package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/horatiucrisan/task-service/interfaces"
	"github.com/horatiucrisan/task-service/middleware"
	"github.com/horatiucrisan/task-service/model"
	"github.com/horatiucrisan/task-service/rabbitmq"
	"github.com/horatiucrisan/task-service/schemas"
	"github.com/horatiucrisan/task-service/utils"
)

type taskController struct {
	taskService          interfaces.TaskService
	userProducer         *rabbitmq.UserProducer
	loggerProducer       *rabbitmq.TaskProducer
	notificationProducer *rabbitmq.TaskProducer
	versionProducer      *rabbitmq.TaskProducer
}

func NewTaskController(
	taskService interfaces.TaskService,
	userProducer *rabbitmq.UserProducer,
	loggerProducer,
	notificationProducer,
	versionProducer *rabbitmq.TaskProducer,
) interfaces.TaskController {
	return &taskController{
		taskService:          taskService,
		userProducer:         userProducer,
		loggerProducer:       loggerProducer,
		notificationProducer: notificationProducer,
		versionProducer:      versionProducer,
	}
}

// POST methods
func (c *taskController) CreateTask(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
	}

	inputData := schemas.CreateTaskSchema{
		AuthorID: user.UID,
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to create the task
	task, duration, err := utils.MeasureTime("Create-Task", func() (model.Task, error) {
		return c.taskService.CreateTask(r.Context(), user.UID, inputData.ProjectID, inputData.HandlerIDs, inputData.Description, inputData.Deadline)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` created a new task `%s`", inputData.AuthorID, task.ID),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the task handlers
	usersData, err := c.userProducer.GetUsers(inputData.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	var notificationUsers []model.NotificationUser
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("You have been assigned a new task `%s`", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Generate the notification messages
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the task version data
	if err = rabbitmq.GenerateVersionData(c.versionProducer, task.ID, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the task data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) CreateSubtask(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.CreateSubtaskSchema{
		AuthorID: user.UID,
		TaskID:   chi.URLParam(r, "taskId"),
	}

	// Validate the request data and the request body
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to create the subtask
	subtask, duration, err := utils.MeasureTime("Create-Subtask", func() (model.Subtask, error) {
		return c.taskService.CreateSubtask(r.Context(), inputData.AuthorID, inputData.TaskID, inputData.HandlerID, inputData.Description)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("Subtask `%s` generated for the task `%s`", subtask.ID, subtask.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the subtask handler data
	usersData, err := c.userProducer.GetUsers([]string{subtask.HandlerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("You have been assigned a new subtask `%s`", subtask.Description),
	}

	// Generate the notification message for the subtask handler
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", subtask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the version data
	if err = rabbitmq.GenerateVersionData(c.versionProducer, subtask.ID, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) CreateTaskResponse(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.CreateTaskResponseSchema{
		AuthorID: user.UID,
		TaskID:   chi.URLParam(r, "taskId"),
	}

	// Validate the data of the request and the request body
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to create the task response
	response, duration, err := utils.MeasureTime("Create-Task-Response", func() (model.Response, error) {
		return c.taskService.CreateTaskResponse(r.Context(), inputData.AuthorID, inputData.TaskID, inputData.Message)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("Task `%s` has a new response", inputData.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		response,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the task data to have access to the author ID
	task, err := c.taskService.GetTaskById(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the task creator
	usersData, err := c.userProducer.GetUsers([]string{task.AuthorID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification user data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("Task `%s` has a new response", task.ID),
	}

	// Send the notifications messages
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the response version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, response.ID, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// GET methods
func (c *taskController) GetTasks(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized user", http.StatusUnauthorized)
		return
	}

	// Get the limit from the request query and convert it to a number
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		http.Error(w, "Invalid limit type", http.StatusUnsupportedMediaType)
		return
	}

	// Get the ID of the last task retrieved
	// Value can be nil
	startAfter := r.URL.Query().Get("startAfter")

	// Generate the request schema
	inputData := schemas.GetTasksSchema{
		UserID:         user.UID,
		ProjectID:      chi.URLParam(r, "projectId"),
		OrderBy:        r.URL.Query().Get("orderBy"),
		OrderDirection: r.URL.Query().Get("orderDirection"),
		Limit:          limit,
		StartAfter:     &startAfter,
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the task lis
	tasks, duration, err := utils.MeasureTime("Get-Tasks", func() ([]model.Task, error) {
		return c.taskService.GetTasks(r.Context(), inputData.ProjectID, inputData.Limit, inputData.OrderBy, inputData.OrderDirection, inputData.StartAfter)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved `%v` from the project `%s`", inputData.UserID, inputData.Limit, inputData.ProjectID),
		"info",
		http.StatusAccepted,
		duration,
		tasks,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, tasks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetTaskById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.GetTaskByIdSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the task
	task, duration, err := utils.MeasureTime("Get-Task-By-Id", func() (model.Task, error) {
		return c.taskService.GetTaskById(r.Context(), inputData.TaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved the data of the task `%s`", inputData.UserID, inputData.TaskID),
		"info",
		http.StatusAccepted,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the task handlers and author
	usersData, err := c.userProducer.GetUsers(append(task.HandlerIDs, task.AuthorID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Combine the task data and the users data
	taskCard := model.TaskCard{
		Task:  task,
		Users: usersData,
	}

	// Encode the data and return
	if err = utils.EncodeData(w, r, taskCard); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetSubtasks(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized user", http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.GetSubtasksSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the subtasks
	subtasks, duration, err := utils.MeasureTime("Get-Subtasks", func() ([]model.Subtask, error) {
		return c.taskService.GetSubtasks(r.Context(), inputData.TaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved the subtasks for the task `%s`", inputData.UserID, inputData.TaskID),
		"info",
		http.StatusAccepted,
		duration,
		subtasks,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtasks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetSubtaskById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the input data request schema
	inputData := schemas.GetSubtaskByIdSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the data of the subtask
	subtask, duration, err := utils.MeasureTime("Get-SubtaskById", func() (model.Subtask, error) {
		return c.taskService.GetSubtaskById(r.Context(), inputData.TaskID, inputData.SubtaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved the data of the subtask `%s` of the task `%s`", inputData.UserID, inputData.SubtaskID, inputData.TaskID),
		"info",
		http.StatusAccepted,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

func (c *taskController) GetResponses(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.GetResponsesSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the responses of the task
	responses, duration, err := utils.MeasureTime("Get-Responses", func() ([]model.Response, error) {
		return c.taskService.GetResponses(r.Context(), inputData.TaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved the responses for the task `%s`", inputData.UserID, inputData.TaskID),
		"info",
		http.StatusAccepted,
		duration,
		responses,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, responses); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetResponseById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the input data request schema
	inputData := schemas.GetResponseByIdSchema{
		UserID:     user.UID,
		TaskID:     chi.URLParam(r, "taskId"),
		ResponseID: chi.URLParam(r, "responseId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the data of the response
	response, duration, err := utils.MeasureTime("Get-ResponseById", func() (model.Response, error) {
		return c.taskService.GetResponseById(r.Context(), inputData.TaskID, inputData.ResponseID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` retrieved the data of the response `%s` of the task `%s`", inputData.UserID, inputData.ResponseID, inputData.TaskID),
		"info",
		http.StatusAccepted,
		duration,
		response,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

// PUT methods
func (c *taskController) UpdateTaskDescription(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateTaskDescriptionSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the task description
	task, duration, err := utils.MeasureTime("Update-Task-Description", func() (model.Task, error) {
		return c.taskService.UpdateTaskDescription(r.Context(), inputData.TaskID, inputData.Description)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` updated the task description to: `%s`", inputData.UserID, inputData.Description),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the handlers data
	usersData, err := c.userProducer.GetUsers(task.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification users list
	notificationUsers := []model.NotificationUser{}
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("Description of the task `%s` has been updated", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Notify the handlers of the task about the update
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update the version of the task
	if err = rabbitmq.GenerateVersionData(c.versionProducer, task.ID, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) AddTaskHandlers(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the request schema
	inputData := schemas.AddTaskHandlersSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the task handlers
	task, duration, err := utils.MeasureTime("Add-Task-Handlers", func() (model.Task, error) {
		return c.taskService.AddTaskHandlers(r.Context(), inputData.TaskID, inputData.HandlerIDs)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` added new handlers to the task `%s`: `%v`", inputData.UserID, inputData.TaskID, inputData.HandlerIDs),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the new handlers data
	usersData, err := c.userProducer.GetUsers(inputData.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUsers := []model.NotificationUser{}
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("You have been assigned the task `%s`", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Notify the new handlers
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the new task version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, task.ID, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) RemoveTaskHandlers(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.RemoveTaskHandlersSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data and the request body
	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to remove the handlers
	task, duration, err := utils.MeasureTime("Remove-Task-Handlers", func() (model.Task, error) {
		return c.taskService.RemoveTaskHandlers(r.Context(), inputData.TaskID, inputData.HandlerIDs)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` removed `%v` handlers from the task `%s`", inputData.UserID, inputData.HandlerIDs, inputData.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the removed handlers data
	usersData, err := c.userProducer.GetUsers(inputData.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUsers := []model.NotificationUser{}
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("You have been removed from the task `%s`", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Notify the users
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the task version data
	if err = rabbitmq.GenerateVersionData(c.versionProducer, task.ID, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateTaskStatusSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the task status
	task, duration, err := utils.MeasureTime("Update-Task-Status", func() (model.Task, error) {
		return c.taskService.UpdateTaskStatus(r.Context(), inputData.TaskID, inputData.Status)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("Uset `%s` updated the status of the task `%s` to `%s`", inputData.UserID, inputData.TaskID, inputData.Status),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the task handlers data
	usersData, err := c.userProducer.GetUsers(task.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUsers := []model.NotificationUser{}
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("Status updated to `%s` for the task `%s`", inputData.Status, task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Notify the users
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the new task version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, task.ID, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskDescription(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateSubtaskDescriptionSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data and the request body
	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the subtask description
	subtask, duration, err := utils.MeasureTime("Update-Subtask-Description", func() (model.Subtask, error) {
		return c.taskService.UpdateSubtaskDescription(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.Description)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` updated the subtask `%s` description `%s`", inputData.UserID, inputData.SubtaskID, inputData.Description),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the subtask handler data
	usersData, err := c.userProducer.GetUsers([]string{subtask.HandlerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification user data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("Description of the subtask `%s` has been updated `%s", inputData.SubtaskID, inputData.Description),
	}

	// Notify the handler
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", subtask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the subtask version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, subtask.ID, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskStatus(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateSubtaskStatusSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data and the body of the request
	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the subtask status
	subtask, duration, err := utils.MeasureTime("Update-Subtask-Status", func() (model.Subtask, error) {
		return c.taskService.UpdateSubtaskStatus(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.Status)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` updated the status of the subtask `%s` to `%v`", inputData.UserID, inputData.SubtaskID, subtask.Done),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the subtask author data
	usersData, err := c.userProducer.GetUsers([]string{subtask.AuthorID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("Status of the subtask `%s` has been updated to `%v`", inputData.SubtaskID, subtask.Done),
	}

	// Notify the subtask author
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", subtask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the subtask version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, subtask.ID, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskHandler(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateSubtaskHandlerSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the subtask handler
	subtask, duration, err := utils.MeasureTime("Update-Subtask-Handler", func() (model.Subtask, error) {
		return c.taskService.UpdateSubtaskHandler(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.HandlerID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` updated the handler of the subtask `%s` to `%s`", inputData.UserID, inputData.SubtaskID, inputData.HandlerID),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the new subtask handler data
	usersData, err := c.userProducer.GetUsers([]string{inputData.HandlerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("You have been assigned the subtask `%s` for the task `%s`", subtask.Description, inputData.TaskID),
	}

	// Notify the handler
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", subtask)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the subtask version
	if err = rabbitmq.GenerateVersionData(c.versionProducer, subtask.ID, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateResponseMessage(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.UpdateResponseMessageSchema{
		UserID:     user.UID,
		TaskID:     chi.URLParam(r, "taskId"),
		ResponseID: chi.URLParam(r, "responseId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the response message
	response, duration, err := utils.MeasureTime("Update-Task-Response", func() (model.Response, error) {
		return c.taskService.UpdateResponseMessage(r.Context(), inputData.TaskID, inputData.ResponseID, inputData.Message)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the task data to have access to the task author ID
	task, err := c.taskService.GetTaskById(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` updated the response of the task `%s` to `%s`", inputData.UserID, inputData.TaskID, inputData.Message),
		"audit",
		http.StatusCreated,
		duration,
		response,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the task author data
	usersData, err := c.userProducer.GetUsers([]string{task.AuthorID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("A new response has been sent for the task `%s`", task.Description),
	}

	// Notify the task author
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) RerollTaskVersion(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.RerollTaskVersion{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the current task data
	currentTask, err := c.taskService.GetTaskById(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to roll back the task version
	task, duration, err := utils.MeasureTime("Reroll-Task-Version", func() (model.Task, error) {
		return c.taskService.RerollTaskVersion(r.Context(), inputData.TaskID, inputData.Task)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` rolled back the task to the version `%d`", inputData.UserID, inputData.Version),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if the handlers of the project are different
	removedHandlers, addedHandlers, err := rabbitmq.CheckTaskHandlers(currentTask.HandlerIDs, task.HandlerIDs, *c.userProducer)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var notificationUsers []model.NotificationUser

	// Iterate over the removed task handlers and generate notification messages for each user
	for _, removedHandler := range removedHandlers {
		notificationUser := model.NotificationUser{
			UserID:  removedHandler.ID,
			Email:   removedHandler.Email,
			Message: fmt.Sprintf("You have been removed from the task `%s`", currentTask.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Iterate over the added task handlers and generate notification messages for each user
	for _, addedaddedHandler := range addedHandlers {
		notificationUser := model.NotificationUser{
			UserID:  addedaddedHandler.ID,
			Email:   addedaddedHandler.Email,
			Message: fmt.Sprintf("You have been assigned a new task: `%s`", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Send the notification data
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) RerollSubtaskVersion(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.RerollSubtaskVersion{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data and the request body data
	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the current subtask
	currentSubtask, err := c.taskService.GetSubtaskById(r.Context(), inputData.TaskID, inputData.SubtaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to roll back the task version
	subtask, duration, err := utils.MeasureTime("Reroll-Subtask-Version", func() (model.Subtask, error) {
		return c.taskService.RerollSubtaskVersion(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.Subtask)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` rolled back the subtask to the version `%d`", inputData.UserID, inputData.Version),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if the handler is different
	currentHandler, oldHandler, err := rabbitmq.CheckSubtaskHandler(currentSubtask.HandlerID, subtask.HandlerID, *c.userProducer)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Check if the handlers are different
	if currentHandler != nil && oldHandler != nil {
		// Generate the users notifications
		var notificationUsers []model.NotificationUser
		notificationUsers = append(notificationUsers, model.NotificationUser{
			UserID:  currentHandler.ID,
			Email:   currentHandler.Email,
			Message: fmt.Sprintf("You are not longer the handler for the subtask `%s`", currentSubtask.Description),
		})

		notificationUsers = append(notificationUsers, model.NotificationUser{
			UserID:  oldHandler.ID,
			Email:   oldHandler.Email,
			Message: fmt.Sprintf("You were assigned the subtask `%s`", subtask.Description),
		})

		// Notify the users
		err := rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", subtask)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// DELETE methods
func (c *taskController) DeleteTaskById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.DeleteTaskByIdSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to delete the task
	task, duration, err := utils.MeasureTime("Delete-Task", func() (model.Task, error) {
		return c.taskService.DeleteTaskById(r.Context(), inputData.TaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` deleted the task `%s", inputData.UserID, inputData.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		task,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Notify the task handlers
	usersData, err := c.userProducer.GetUsers(task.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notifications
	notificationUsers := []model.NotificationUser{}
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("Task `%s` has been deleted by the author", task.Description),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Notify the handlers
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// TODO: REMOVE SUBTASKS

	// Encode the data and return it
	if err = utils.EncodeData(w, r, "OK"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) DeleteSubtaskById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.DeleteSubtaskByIdSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to delete the subtask
	subtask, duration, err := utils.MeasureTime("Delete-Subtask", func() (model.Subtask, error) {
		return c.taskService.DeleteSubtaskById(r.Context(), inputData.TaskID, inputData.SubtaskID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` deleted the subtask `%s` for the task `%s`", inputData.UserID, inputData.SubtaskID, inputData.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		subtask,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the subtask handler data
	usersData, err := c.userProducer.GetUsers([]string{subtask.HandlerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the user notification data
	notificationUser := model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("The subtask `%s` has been deleted by the author", subtask.Description),
	}

	// Notify the handler
	err = rabbitmq.GenerateNotificationData(c.notificationProducer, []model.NotificationUser{notificationUser}, "email", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, "OK"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) DeleteResponseById(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the user token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Generate the request schema
	inputData := schemas.DeleteResponseById{
		UserID:     user.UID,
		TaskID:     chi.URLParam(r, "taskId"),
		ResponseID: chi.URLParam(r, "responseId"),
	}

	// Validate the input data
	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to delete the response
	response, duration, err := utils.MeasureTime("Delete-Task-Response", func() (model.Response, error) {
		return c.taskService.DeleteResponseById(r.Context(), inputData.TaskID, inputData.ResponseID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.loggerProducer,
		fmt.Sprintf("User `%s` deleted the response `%s` of the task `%s`", inputData.UserID, inputData.ResponseID, inputData.TaskID),
		"audit",
		http.StatusCreated,
		duration,
		response,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, "OK"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
