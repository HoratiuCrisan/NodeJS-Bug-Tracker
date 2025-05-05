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

// CreateProject retrieves data from the service layer and adds it into the database
//
// Parameter:
//   - ctx: Request-scoped context
//   - project: The project data
//   - code: the code object
//
// Returns:
//   - mode.Project: The data of the project
//   - error: An error that occured durint the process
func (r *projectRepository) CreateProject(ctx context.Context, project model.Project, code model.Code) (model.Project, error) {
	// Create the new project document and add the data into it
	_, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(project.ID).Create(ctx, project)
	if err != nil {
		return model.Project{}, err
	}

	// Create the new code document to make sure not code is repeated
	_, err = r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(code.Code).Create(ctx, code)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// IsCodeAvailable retrieves data from the service layer and checks if the code is not stored into the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - code: The newly generated code
//
// Returns:
//   - bool: True if the code is availabe and false otherwise
//   - error: An error that occured during the process
func (r *projectRepository) IsCodeAvailable(ctx context.Context, code string) (bool, error) {
	// Get the document from the codes collection
	docSnapshot, err := r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(code).Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return true, nil
		}

		return false, err
	}

	// Check if the document with that code exists
	if !docSnapshot.Exists() {
		return true, nil
	}

	return false, nil
}

// GetProjects retrieves data from the service layer and returns a list of projects from the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - limit: The max number of projects to retrieve
//   - orderBy: The project order field
//   - orderDirection: The direction of the ordering
//   - startAfter: The ID of the last project retrieved at the previous fetching request
//
// Returns:
//   - []model.Project: The list of retrieved projects
//   - error: An error that occured during the fetching process
func (r *projectRepository) GetProjects(ctx context.Context, limit int, orderBy, orderDirection string, startAfter *string) ([]model.Project, error) {
	// Limit the number of projects retrieved at a time
	query := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Limit(limit)

	// Query based on the order criteria and direction
	if orderDirection == "asc" {
		query = query.OrderBy(orderBy, firestore.Asc)
	} else {
		query = query.OrderBy(orderBy, firestore.Desc)
	}

	// Check if the ID of the last project was passed
	if startAfter != nil && *startAfter != "" {
		// Get the snapshot of the last project based on the ID
		lasDocumentSanpshot, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(*startAfter).Get(ctx)
		if err != nil {
			return nil, err
		}

		// Order the documents collection
		query = query.StartAfter(lasDocumentSanpshot.Data()[orderBy])
	}

	// Retrieve the documents
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return nil, err
	}

	// Add each project into a list
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

// GetProjectById retrieves the ID of the project from the service layer and retrieves the data from the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//
// Returns:
//   - model.Project: The project data
//   - error: An error that occured during the fetching process
func (r *projectRepository) GetProjectById(ctx context.Context, projectId string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the snapshot of the document and check if it exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found", projectId)
		}
		return model.Project{}, err
	}

	// Add the data from the snapshot to the project object
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// GetUserProjects retrieves the ID of the user from the service layer and returns a list of projects
//
// Parameters:
//   - ctx: Request-scoped context
//   - userId: The ID of the user
//
// Returns:
//   - []model.Project: The list of projects the user is part of
//   - error: An error that occured during the fetching process
func (r *projectRepository) GetUserProjects(ctx context.Context, userId string) ([]model.Project, error) {
	// Get the document references where the user is the manager of the project
	managerDocRefs := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).
		Where("projectManagerId", "==", userId)

	// Get the document references where the user is a member of the gorup
	memberDocRefs := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).
		Where("memberIds", "array-contains", userId)

	// Get the document snapshots for the manager documents
	managerDocSnapshots, err := managerDocRefs.Documents(ctx).GetAll()
	if err != nil {
		if status.Code(err) != codes.NotFound {
			return nil, err
		}
	}

	// Get the document snapshots for the member documents
	memberDocSnapshots, err := memberDocRefs.Documents(ctx).GetAll()
	if err != nil {
		if status.Code(err) != codes.NotFound {
			return nil, err
		}
	}

	var projects []model.Project
	seen := make(map[string]bool)

	// Iterate over the manager snapshots and add each project to the list
	for _, doc := range managerDocSnapshots {
		var project model.Project
		if err := doc.DataTo(&project); err != nil {
			return nil, err
		}
		// Add each project to the list where the user is the manager
		projects = append(projects, project)
		seen[project.ID] = true
	}

	// Iterate over teh member snapshots and add each project to the list
	for _, doc := range memberDocSnapshots {
		var project model.Project
		if err := doc.DataTo(&project); err != nil {
			return nil, err
		}

		if seen[project.ID] {
			continue // skip duplicate
		}
		projects = append(projects, project)
	}

	return projects, nil
}

// UpdateProjectTitle retrieves the new title from the service layer and updates the project title from the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - title: The new project title
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the update process
func (r *projectRepository) UpdateProjectTitle(ctx context.Context, projectId, title string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and check if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project title", projectId)
		}
		return model.Project{}, err
	}

	// Add the snapshot data to the project vriable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Set the new project title and update the data in the database
	project.Title = title
	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// UpdateProjectDescription retrieves the new description from the service layer and updates the project data
//
// Parameters:
//   - ctx: Requests-scoped context
//   - projectId: The ID of the project
//   - description: The new project description
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the update process
func (r *projectRepository) UpdateProjectDescription(ctx context.Context, projectId, description string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and check if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project description", projectId)
		}
		return model.Project{}, err
	}

	// Add the snapshot data to the project variable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Set the new project description and update the data inside the database
	project.Description = description
	if _, err := docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// UpdateProjectManager retreives the ID of the new project manager and updates the project data
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - managerId: The ID of the new manager
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the udpate process
func (r *projectRepository) UpdateProjectManager(ctx context.Context, projectId, managerId string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and check if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to update project manager", projectId)
		}

		return model.Project{}, err
	}

	// Add the snapshot data to the project variable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Check if the new manager ID is part of the members list
	// and remove it from the members list
	var members []string
	for _, memberId := range project.MemberIDs {
		if memberId != managerId {
			members = append(members, memberId)
		}
	}

	// Check if the old manager ID is different from the new one
	// and add the old manager ID to the members list
	if project.ProjectManagerID != managerId {
		members = append(members, project.ProjectManagerID)
		// Update the project manager
		project.ProjectManagerID = managerId
	}

	// Update the members list with the old manager
	project.MemberIDs = members

	// Update the project data into the database
	if _, err := docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// AddProjectMembers retrieves a list of user IDs from the service layer and merges it to the project member list
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//   - members: The list of member IDs
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the update process
func (r *projectRepository) AddProjectMembers(ctx context.Context, projectId string, members []string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and checks if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to add members", projectId)
		}
		return model.Project{}, err
	}

	// Assert the snapshot data to the project variable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Iterate over the new members list and check if any of the new members is already present in the project members list
	// omit the duplicate IDs
	var filteredMembers []string
	for _, member := range members {
		if member != project.ProjectManagerID {
			filteredMembers = append(filteredMembers, member)
		}
	}

	// Add the unique members to the project members list
	project.MemberIDs = append(project.MemberIDs, filteredMembers...)

	// Update the project data
	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// JoinProjectMembers retrieves the ID of the new user and the project code from the service layer
//
// Parameters:
//   - ctx: Request-scoped context
//   - userId: The ID of the user that followed the invitation link
//   - code: The unique project code
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the update process
func (r *projectRepository) JoinProjectMembers(ctx context.Context, userId, code string) (model.Project, error) {
	// Get all the projects with the code
	docSnapshots, err := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Where("code", "==", code).Documents(ctx).GetAll()
	if err != nil {
		return model.Project{}, err
	}

	// Get the project document data
	var projects []model.Project
	for _, docSnapshot := range docSnapshots {
		var project model.Project
		if err = docSnapshot.DataTo(&project); err != nil {
			return model.Project{}, err
		}

		projects = append(projects, project)
	}

	project := projects[0]

	// Check if the user is the manager and stop the process if so
	if userId == project.ProjectManagerID {
		return model.Project{}, nil
	}

	// Check if the user is part of the members list
	// and stop the process if so
	if slices.Contains(project.MemberIDs, userId) == true {
		return model.Project{}, nil
	}

	// Add the user to the project members list
	project.MemberIDs = append(project.MemberIDs, userId)

	// Update the project data
	_, err = r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(project.ID).Set(ctx, project)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// RemoveProjectMembers retrieves a list of users from the service layer and removes them from the project members list
//
// Parameters:
//   - ctx: Request-scoped context
//   - perojectId: The ID of the project
//   - members: The list of user IDs to remove from the project
//
// Returns:
//   - model.Project: The updated project data
//   - error: An error that occured during the update process
func (r *projectRepository) RemoveProjectMembers(ctx context.Context, projectId string, members []string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and check if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found. Failed to remove members", projectId)
		}
		return model.Project{}, err
	}

	// Add the project data to the variable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Iterate over the list of project members
	// remove each user ID that was received from the parameters from the members list
	var filteredMembers []string
	for _, projectMember := range project.MemberIDs {
		if slices.Contains(members, projectMember) == false {
			filteredMembers = append(filteredMembers, projectMember)
		}
	}

	// Update the project members list with the filtered one
	project.MemberIDs = filteredMembers

	// Update the project data into the database
	if _, err = docRef.Set(ctx, project); err != nil {
		return model.Project{}, err
	}

	return project, nil
}

// DeleteProjectById retrieves the ID of the project from the service layer and remove the project from the database
//
// Parameters:
//   - ctx: Request-scoped context
//   - projectId: The ID of the project
//
// Returns:
//   - model.Project: The data of the deleted project
//   - error: An error that occured during the delete process
func (r *projectRepository) DeleteProjectById(ctx context.Context, projectId string) (model.Project, error) {
	// Get the document reference
	docRef := r.client.Collection(utils.EnvInstances.PROJECTS_COLLECTION).Doc(projectId)

	// Get the document snapshot and check if the project exists
	docSnapshot, err := docRef.Get(ctx)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return model.Project{}, fmt.Errorf("project with ID %s not found", projectId)
		}
		return model.Project{}, err
	}

	// Add the project data to the variable
	var project model.Project
	if err = docSnapshot.DataTo(&project); err != nil {
		return model.Project{}, err
	}

	// Delete the project from the database
	if _, err = docRef.Delete(ctx); err != nil {
		return model.Project{}, err
	}

	// Remove the code of the deleted process from the codes collection
	_, err = r.client.Collection(utils.EnvInstances.CODES_COLLECTION).Doc(project.Code).Delete(ctx)
	if err != nil {
		return model.Project{}, err
	}

	return project, nil
}
