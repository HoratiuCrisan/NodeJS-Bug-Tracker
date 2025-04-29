package interfaces

import (
	"context"

	"github.com/horatiucrisan/project-service/model"
)

type ProjectService interface {
	CreateProject(ctx context.Context, title, description, managerId string, memberIds []string) (model.Project, error)
	GenerateInvitationLink(ctx context.Context, projectId string) (string, error)

	GetProjects(ctx context.Context, limit int, orderBy, orderDirection string, startAfter *string) ([]model.Project, error)
	GetProjectById(ctx context.Context, projectId string) (model.Project, error)
	GetUserProjects(ctx context.Context, userId string) ([]model.Project, error)

	UpdateProjectTitle(ctx context.Context, projectId, title string) (model.Project, error)
	UpdateProjectDescription(ctx context.Context, projectId, description string) (model.Project, error)
	UpdateProjectManager(ctx context.Context, projectId, managerId string) (model.Project, error)
	AddProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error)
	RemoveProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error)
	JoinProjectMembers(ctx context.Context, userId string, code string, expiration int64) (model.Project, error)

	DeleteProjectById(ctx context.Context, projectId string) (model.Project, error)
}
