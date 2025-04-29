package interfaces

import (
	"context"

	"github.com/horatiucrisan/project-service/model"
)

type ProjectRepository interface {
	CreateProject(ctx context.Context, project model.Project, code model.Code) (model.Project, error)

	IsCodeAvailable(ctx context.Context, code string) (bool, error)

	GetProjects(ctx context.Context, limit int, orderBy, orderDirection string, startAfter *string) ([]model.Project, error)
	GetProjectById(ctx context.Context, prjectId string) (model.Project, error)
	GetUserProjects(ctx context.Context, userId string) ([]model.Project, error)

	UpdateProjectTitle(ctx context.Context, projectId, title string) (model.Project, error)
	UpdateProjectDescription(ctx context.Context, projectId, description string) (model.Project, error)
	UpdateProjectManager(ctx context.Context, projectId, managetId string) (model.Project, error)
	AddProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error)
	RemoveProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error)
	JoinProjectMembers(ctx context.Context, userId, code string) (model.Project, error)

	DeleteProjectById(ctx context.Context, projectId string) (model.Project, error)
}
