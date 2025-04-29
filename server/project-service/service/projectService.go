package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/horatiucrisan/project-service/interfaces"
	"github.com/horatiucrisan/project-service/model"
	"github.com/horatiucrisan/project-service/utils"
)

type projectService struct {
	projectRepository interfaces.ProjectRepository
}

func NewProjectService(projectRepository interfaces.ProjectRepository) interfaces.ProjectService {
	return &projectService{projectRepository: projectRepository}
}

// CreateProject retrieves the data from the controller layer and sends it to the repository layer to create a new project
// Each project has a unique code that is also stored into a separate collection
//
// Parameters:
//   - ctx: Request-scoped context
//   - title: The project title
//   - description: The description of the project
//   - managerId: The ID of the project manager
//   - memberIds: The ID list of the project members
//
// Returns:
//   - model.Project: The created project object
//   - error: An error that occured during the project creation
func (s *projectService) CreateProject(ctx context.Context, title, description, managerId string, memberIds []string) (model.Project, error) {
	// Generate the project ID using the uuid library
	projectId := uuid.NewString()

	// Try generating a unique 6 digit code for the project
	// Try generating the code for at max 10 times
	projectCode, err := s.generateProjectCode(ctx, 6, 10)

	// If the project code was not generated return an error
	if err != nil || projectCode == "" {
		return model.Project{}, err
	}

	// Get the timestamp of the project creation
	now := time.Now().Unix()

	// Generate the project model
	projectData := model.Project{
		ID:               projectId,
		Title:            title,
		Description:      description,
		ProjectManagerID: managerId,
		MemberIDs:        memberIds,
		CreatedAt:        now,
		Code:             projectCode,
	}

	// Generate the code model
	codeData := model.Code{
		Code: projectCode,
	}

	// Send the data to the service layer to create the project
	project, err := s.projectRepository.CreateProject(ctx, projectData, codeData)
	if err != nil {
		return model.Project{}, err
	}

	// return the project data
	return project, nil
}

// GenerateInvitationLink retrieves the ID of the project from the controller layer
// and generates an invitation link using its 6 digit code
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//
// Returns:
//   - string: The project invitation URL
//   - error: An error that occured during the link creation process
func (s *projectService) GenerateInvitationLink(ctx context.Context, projectId string) (string, error) {
	// Send the data to the repository layer to retrieve the project data
	project, err := s.projectRepository.GetProjectById(ctx, projectId)
	if err != nil {
		return "", err
	}

	// Generate the expiration time for the next 24h
	expirationTime := time.Now().Add(time.Hour * 24)

	// Generate the invitation URL
	baseUrl := utils.EnvInstances.CLIENT_URL + "invite"
	return fmt.Sprintf("%s?code=%s&expires=%d", baseUrl, project.Code, expirationTime.Unix()), nil
}

// GetProjects retrieves data from the controller and sends it to the repository layer to retrieve a list of projects
//
// Parameters:
//   - ctx: Request-scoped context
//   - limit: The max number of projects to retrieve
//   - orderBy: The project oreder field
//   - orderDirection: The direction of the order
//   - startAfter: The ID of the last project retrieved at the previous fetching request
//
// Returns:
//   - []model.Proejct: The list of retrieved projects
//   - error: An error that occured during the feching process
func (s *projectService) GetProjects(ctx context.Context, limit int, oderBy, orderDirection string, startAfter *string) ([]model.Project, error) {
	// Send the dat to the repository layer to retrieve the projects list
	projects, err := s.projectRepository.GetProjects(ctx, limit, oderBy, orderDirection, startAfter)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// GetProjectById retrieves the project ID from the controller
// and sends it to the repository layer to retrieve the data of it
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//
// Returns:
//   - model.Project: The data of the project
//   - error: An error that occured during the fetching process
func (s *projectService) GetProjectById(ctx context.Context, projectId string) (model.Project, error) {
	// Send the data to the repository layer to retrieve the project object
	project, err := s.projectRepository.GetProjectById(ctx, projectId)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// GetUserProjects retrieves data from the controller
// and sends it to the repository layer to retrieve the projects the user is part of
//
// Parameters:
//   - ctx: Request-scoped context
//   - userId: The ID of the user
//
// Returns:
//   - []model.Project: The list of retrieved projects
//   - error: An error that occured during the fetching process
func (s *projectService) GetUserProjects(ctx context.Context, userId string) ([]model.Project, error) {
	// Send the data to the repository layer to retrieve the user projects
	projects, err := s.projectRepository.GetUserProjects(ctx, userId)
	if err != nil {
		return nil, err
	}

	return projects, nil
}

// UpdateProjectTitle retrieves the data from the controller layer
// and sends it to the repository layer to udpate the title of the project
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - title: The new project title
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the updating process
func (s *projectService) UpdateProjectTitle(ctx context.Context, projectId, title string) (model.Project, error) {
	// Send the data to the repository layer to update th project title
	project, err := s.projectRepository.UpdateProjectTitle(ctx, projectId, title)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// UpdateProjectDescription retrieves data from the controller layer
// and sends it to the repository layer to update the description of the project
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - description: The new project description
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the updating process
func (s *projectService) UpdateProjectDescription(ctx context.Context, projectId, description string) (model.Project, error) {
	// Send the data to the repository layer to update the project description
	project, err := s.projectRepository.UpdateProjectDescription(ctx, projectId, description)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// UpdateProjectManager retrieves data from the controller layer
// and sends it to the repository layer to update the project manager
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - managerId: The ID of the new project manager
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the updating process
func (s *projectService) UpdateProjectManager(ctx context.Context, projectId, managerId string) (model.Project, error) {
	// Send the data to the repository layer to update the project manager
	project, err := s.projectRepository.UpdateProjectManager(ctx, projectId, managerId)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// AddProjectMembers retrieves data from the controller layer
// and sends it to the repository layer to add new members to the project
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - memberIds: The list of new project members
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the updating process
func (s *projectService) AddProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error) {
	// Seend the data to the repository layer to add members to the project
	project, err := s.projectRepository.AddProjectMembers(ctx, projectId, memberIds)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// RemoveProjectMembers retrieves data from the controller layer
// and sends it to the repository layer to remove users from the project
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - memberIds: The list of project members to remove
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the updating process
func (s *projectService) RemoveProjectMembers(ctx context.Context, projectId string, memberIds []string) (model.Project, error) {
	// Send the data to the service layer to remove members from the project
	project, err := s.projectRepository.RemoveProjectMembers(ctx, projectId, memberIds)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// JoinProjectMembers retrieves data from the controller layer
// and sends it to the repository layer to add the user to the project members
//
// Parameters:
//   - ctx: Request-scoped context
//   - userId: The ID of the user that accessed the link
//   - code: The unique project joining code
//   - expiration: The expiration time for the invitation link
//
// Returns:
//   - model.Project: The updated project data
//   - An error that occured during the updating process
func (s *projectService) JoinProjectMembers(ctx context.Context, userId string, code string, expiration int64) (model.Project, error) {
	// Check if the expiration time has passed
	if time.Now().Unix() > expiration {
		return model.Project{}, errors.New("invitation expired")
	}

	// Send the data to the repository layer to add the user to the project
	project, err := s.projectRepository.JoinProjectMembers(ctx, userId, code)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// DeleteProjectById retrieves data from the controller layer
// and sends it to the repository layer to delete the project
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//
// Returns:
//   - model.Project: The data of the project before deletion
//   - error: An error that occured during the deletion process
func (s *projectService) DeleteProjectById(ctx context.Context, projectId string) (model.Project, error) {
	// Send the data to the repository layer to delete the project
	project, err := s.projectRepository.DeleteProjectById(ctx, projectId)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// generateProjectCode is a private method that retrieves data from the controller layer
// and sends it to a utils funciton to generate a unique code for each project
//
// Parameters:
//   - ctx: Request-scoped context
//   - length: The number of characters the code is made out of
//   - maxAttempts:	The number of attempts to generate the unique code
//
// Returns:
//   - string: The generated unique code
//   - error: An error that occured during the creation process
func (s *projectService) generateProjectCode(ctx context.Context, length, maxAttempts int) (string, error) {
	// Try generating an unique code
	for i := 0; i < maxAttempts; i++ {
		// Send the data to the utils method to generate the code
		code := utils.GenerateCode(length)

		// Send the data to the repository layer to check if the code is avaliable
		isAvailable, err := s.projectRepository.IsCodeAvailable(ctx, code)
		if err != nil {
			return "", err
		}

		// If the code is avaliable return it
		if isAvailable == true {
			return code, nil
		}
	}

	// If after "maxAttempts" the an unique code was not generated,
	// return an error message
	return "", errors.New("could not genereate a unique proejct code after multiple attempts")
}
