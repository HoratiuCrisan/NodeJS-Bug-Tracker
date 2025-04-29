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
	taskService  interfaces.TaskService
	userProducer *rabbitmq.UserProducer
}

func NewTaskController(taskService interfaces.TaskService, userProducer *rabbitmq.UserProducer) interfaces.TaskController {
	return &taskController{
		taskService:  taskService,
		userProducer: userProducer,
	}
}

func (c *taskController) CreateTask(w http.ResponseWriter, r *http.Request) {
	var inputData schemas.CreateTaskSchema

	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
	}

	inputData.AuthorID = user.UID

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.CreateTask(r.Context(), user.UID, inputData.ProjectID, inputData.HandlerIDs, inputData.Description, inputData.Deadline)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// logDetails := model.LogMessage{
	// 	Request:  r,
	// 	Response: w,
	// 	Type:     "audit",
	// 	Message:  fmt.Sprintf("Task `%s` created by `%s` successfully", task.ID, task.AuthorID),
	// 	Status:   http.StatusCreated,
	// 	Duration: 200,
	// 	User:     user,
	// 	Data:     task,
	// }

	// fmt.Println(logDetails)

	var userIds []string
	userIds = append(userIds, task.AuthorID)
	userIds = append(userIds, task.HandlerIDs...)

	usersData, err := c.userProducer.GetUsers(userIds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println(usersData)

	var notificationUsers []model.NotificationUser
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			ID:      userData.ID,
			Email:   userData.Eamil,
			Message: fmt.Sprintf("You have been assigned a new task"),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// notificationDetails := model.NotificationMessage{
	// 	Users: notificationUsers,
	// 	Type:  "email",
	// 	Data:  task,
	// }

	// fmt.Println(notificationDetails)

	taskCard := model.TaskCard{
		Task:  task,
		Users: usersData,
	}

	if err = utils.EncodeData(w, r, taskCard); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) CreateSubtask(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.CreateSubtaskSchema{
		AuthorID: user.UID,
		TaskID:   chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	subtask, err := c.taskService.CreateSubtask(r.Context(), inputData.AuthorID, inputData.TaskID, inputData.HandlerID, inputData.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) CreateTaskResponse(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.CreateTaskResponseSchema{
		AuthorID: user.UID,
		TaskID:   chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response, err := c.taskService.CreateTaskResponse(r.Context(), inputData.AuthorID, inputData.TaskID, inputData.Message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetTasks(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized user", http.StatusUnauthorized)
		return
	}

	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		http.Error(w, "Invalid limit type", http.StatusUnsupportedMediaType)
		return
	}

	startAfter := r.URL.Query().Get("startAfter")
	inputData := schemas.GetTasksSchema{
		UserID:         user.UID,
		ProjectID:      chi.URLParam(r, "projectId"),
		OrderBy:        r.URL.Query().Get("orderBy"),
		OrderDirection: r.URL.Query().Get("orderDirection"),
		Limit:          limit,
		StartAfter:     &startAfter,
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	tasks, err := c.taskService.GetTasks(r.Context(), inputData.ProjectID, inputData.Limit, inputData.OrderBy, inputData.OrderDirection, inputData.StartAfter)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, tasks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetSubtasks(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized user", http.StatusUnauthorized)
		return
	}

	taskId := chi.URLParam(r, "taskId")

	inputData := schemas.GetSubtasksSchema{
		UserID: user.UID,
		TaskID: taskId,
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	subtasks, err := c.taskService.GetSubtasks(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, subtasks); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetResponses(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.GetResponsesSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responses, err := c.taskService.GetResponses(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, responses); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) GetTaskById(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.GetTaskByIdSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.GetTaskById(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateTaskDescription(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateTaskDescriptionSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	// if err = utils.ValidateParams(inputData); err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.UpdateTaskDescription(r.Context(), inputData.TaskID, inputData.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) AddTaskHandlers(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	inputData := schemas.AddTaskHandlersSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.AddTaskHandlers(r.Context(), inputData.TaskID, inputData.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) RemoveTaskHandlers(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.RemoveTaskHandlersSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.RemoveTaskHandlers(r.Context(), inputData.TaskID, inputData.HandlerIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateTaskStatus(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateTaskStatusSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	task, err := c.taskService.UpdateTaskStatus(r.Context(), inputData.TaskID, inputData.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskDescription(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateSubtaskDescriptionSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	subtask, err := c.taskService.UpdateSubtaskDescription(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskStatus(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateSubtaskStatusSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	if err = utils.ValidateBody(r, inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	subtask, err := c.taskService.UpdateSubtaskStatus(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.Status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateSubtaskHandler(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateSubtaskHandlerSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	subtask, err := c.taskService.UpdateSubtaskHandler(r.Context(), inputData.TaskID, inputData.SubtaskID, inputData.HandlerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, subtask); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) UpdateResponseMessage(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.UpdateResponseMessageSchema{
		UserID:     user.UID,
		TaskID:     chi.URLParam(r, "taskId"),
		ResponseID: chi.URLParam(r, "responseId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response, err := c.taskService.UpdateResponseMessage(r.Context(), inputData.TaskID, inputData.ResponseID, inputData.Message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) DeleteTaskById(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.DeleteTaskByIdSchema{
		UserID: user.UID,
		TaskID: chi.URLParam(r, "taskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	success, err := c.taskService.DeleteTaskById(r.Context(), inputData.TaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, success); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) DeleteSubtaskById(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.DeleteSubtaskByIdSchema{
		UserID:    user.UID,
		TaskID:    chi.URLParam(r, "taskId"),
		SubtaskID: chi.URLParam(r, "subtaskId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	success, err := c.taskService.DeleteSubtaskById(r.Context(), inputData.TaskID, inputData.SubtaskID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, success); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *taskController) DeleteResponseById(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	inputData := schemas.DeleteResponseById{
		UserID:     user.UID,
		TaskID:     chi.URLParam(r, "taskId"),
		ResponseID: chi.URLParam(r, "responseId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	success, err := c.taskService.DeleteResponseById(r.Context(), inputData.TaskID, inputData.ResponseID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, success); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
