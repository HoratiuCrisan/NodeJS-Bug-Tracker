package interfaces

import "net/http"

type ProjectController interface {
	CreateProject(w http.ResponseWriter, r *http.Request)
	GenerateInvitationLink(w http.ResponseWriter, r *http.Request)

	GetProjects(w http.ResponseWriter, r *http.Request)
	GetProjectById(w http.ResponseWriter, r *http.Request)
	GetUserProjects(w http.ResponseWriter, r *http.Request)

	UpdateProjectTitle(w http.ResponseWriter, r *http.Request)
	UpdateProjectDescription(w http.ResponseWriter, r *http.Request)
	UpdateProjectManager(w http.ResponseWriter, r *http.Request)
	AddProjectMembers(w http.ResponseWriter, r *http.Request)
	RemoveProjectMembers(w http.ResponseWriter, r *http.Request)
	JoinProjectMembers(w http.ResponseWriter, r *http.Request)

	DeleteProjectById(w http.ResponseWriter, r *http.Request)
}
