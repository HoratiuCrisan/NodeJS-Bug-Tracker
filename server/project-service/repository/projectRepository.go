package repository

import (
	"context"
	"fmt"
	"slices"

	firestore "cloud.google.com/go/firestore"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/horatiucrisan/project-service/interfaces"
	"github.com/horatiucrisan/project-service/model"
	"github.com/horatiucrisan/project-service/utils"
)

type projectRepository struct {
	client *firestore.Client
}

func NewProjectRepository(client *firestore.Client) interfaces.ProjectRepository {
	return &projectRepository{client: client}
}

func (r *projectRepository) CreateProject(ctx context.Context, project model.Project, code model.Code) (model.Project, error) {
	_, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(project.ID).Create(ctx, project)
	if err != nil {
		return model.Project{}, err
	}

	_, err = r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(code.Code).Create(ctx, code)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) IsCodeAvailable(ctx context.Context, code string) (bool, error) {
	docSnapshot, err := r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(code).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return true, nil
		}

		return false, err
	}

	if !docSnapshot.Exists() {
		return true, nil
	}

	return false, nil
}

func (r *projectRepository) GetProjects(ctx context.Context, limit int, orderBy, orderDirection string, startAfter *string) ([]model.Project, error) {
	query := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Limit(limit)

	if orderDirection == "asc" {
		query = query.OrderBy(orderBy, firestore.Asc)
	} else {
		query = query.OrderBy(orderBy, firestore.Desc)
	}

	if startAfter != nil && *startAfter != "" {
		lasDocumentSanpshot, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(*startAfter).Get(ctx)
		if err != nil {
			return nil, err
		}

		query = query.StartAfter(lasDocumentSanpshot.Data()[orderBy])
	}

	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	projects := []model.Project{}
	for _, doc := range docs {
		var project model.Project
		if err := doc.DataTo(&project); err != nil {
			return nil, err
		}

		projects = append(projects, project)
	}

	return projects, nil
}

func (r *projectRepository) GetProjectById(ctx context.Context, projectId string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) GetUserProjects(ctx context.Context, userId string) ([]model.Project, error) {
	managerDocRefs := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).
		Where("projectManagerId", "==", userId)

	memberDocRefs := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).
		Where("memberIds", "array-contains", userId)

	managerDocSnapshots, err := managerDocRefs.Documents(ctx).GetAll()
	if err != nil {
		if status.Code(err) != codes.NotFound {
			return nil, err
		}
	}

	memberDocSnapshots, err := memberDocRefs.Documents(ctx).GetAll()
	if err != nil {
		if status.Code(err) != codes.NotFound {
			return nil, err
		}
	}

	var projects []model.Project
	seen := make(map[string]bool)

	for _, doc := range managerDocSnapshots {
		var project model.Project
		if err := doc.DataTo(&project); err != nil {
			return nil, err
		}
		project.ID = doc.Ref.ID
		projects = append(projects, project)
		seen[project.ID] = true
	}

	for _, doc := range memberDocSnapshots {
		var project model.Project
		if err := doc.DataTo(&project); err != nil {
			return nil, err
		}
		project.ID = doc.Ref.ID
		if seen[project.ID] {
			continue // skip duplicate
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (r *projectRepository) UpdateProjectTitle(ctx context.Context, projectId, title string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project title", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	project.Title = title
	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) UpdateProjectDescription(ctx context.Context, projectId, description string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project description", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	project.Description = description
	if _, err := docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) UpdateProjectManager(ctx context.Context, projectId, managerId string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project manager", projectId)
		}

		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	var members []string
	for _, memberId := range project.MemberIDs {
		if memberId != managerId {
			members = append(members, memberId)
		}
	}

	if project.ProjectManagerID != managerId {
		members = append(members, project.ProjectManagerID)
		project.ProjectManagerID = managerId
	}

	project.MemberIDs = members

	if _, err := docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) AddProjectMembers(ctx context.Context, projectId string, members []string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to add members", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	var filteredMembers []string
	for _, member := range members {
		if member != project.ProjectManagerID {
			filteredMembers = append(filteredMembers, member)
		}
	}

	project.MemberIDs = append(project.MemberIDs, filteredMembers...)
	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) JoinProjectMembers(ctx context.Context, userId, code string) (model.Project, error) {
	docSnapshots, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Where("code", "==", code).Documents(ctx).GetAll()
	if err != nil {
		return model.Project{}, err
	}

	var projects []model.Project
	for _, docSnapshot := range docSnapshots {
		var project model.Project
		if err = docSnapshot.DataTo(&project); err != nil {
			return model.Project{}, err
		}

		projects = append(projects, project)
	}

	project := projects[0]

	if userId == project.ProjectManagerID {
		return model.Project{}, nil
	}

	if slices.Contains(project.MemberIDs, userId) == true {
		return model.Project{}, nil
	}

	project.MemberIDs = append(project.MemberIDs, userId)

	_, err = r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(project.ID).Set(ctx, project)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) RemoveProjectMembers(ctx context.Context, projectId string, members []string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to remove members", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	var filteredMembers []string
	for _, projectMember := range project.MemberIDs {
		if slices.Contains(members, projectMember) == false {
			filteredMembers = append(filteredMembers, projectMember)
		}
	}

	project.MemberIDs = filteredMembers

	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

func (r *projectRepository) DeleteProjectById(ctx context.Context, projectId string) (model.Project, error) {
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found", projectId)
		}
		return model.Project{}, err
	}

	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	if _, err = docRef.Delete(ctx); err != nil {
		return model.Project{}, err
	}

	_, err = r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(project.Code).Delete(ctx)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}
