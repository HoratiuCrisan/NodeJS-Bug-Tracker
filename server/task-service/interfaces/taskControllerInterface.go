package interfaces

import (
	"net/http"
)

type TaskController interface {
	CreateTask(w http.ResponseWriter, r *http.Request)
	CreateSubtask(w http.ResponseWriter, r *http.Request)
	CreateTaskResponse(w http.ResponseWriter, r *http.Request)

	GetTasks(w http.ResponseWriter, r *http.Request)
	GetSubtasks(w http.ResponseWriter, r *http.Request)
	GetResponses(w http.ResponseWriter, r *http.Request)
	GetTaskById(w http.ResponseWriter, r *http.Request)
	GetSubtaskById(w http.ResponseWriter, r *http.Request)
	GetResponseById(w http.ResponseWriter, r *http.Request)

	UpdateTaskDescription(w http.ResponseWriter, r *http.Request)
	AddTaskHandlers(w http.ResponseWriter, r *http.Request)
	RemoveTaskHandlers(w http.ResponseWriter, r *http.Request)
	UpdateTaskStatus(w http.ResponseWriter, r *http.Request)
	UpdateSubtaskDescription(w http.ResponseWriter, r *http.Request)
	UpdateSubtaskStatus(w http.ResponseWriter, r *http.Request)
	UpdateSubtaskHandler(w http.ResponseWriter, r *http.Request)
	UpdateResponseMessage(w http.ResponseWriter, r *http.Request)
	RerollTaskVersion(w http.ResponseWriter, r *http.Request)
	RerollSubtaskVersion(w http.ResponseWriter, r *http.Request)

	DeleteTaskById(w http.ResponseWriter, r *http.Request)
	DeleteSubtaskById(w http.ResponseWriter, r *http.Request)
	DeleteResponseById(w http.ResponseWriter, r *http.Request)
}
