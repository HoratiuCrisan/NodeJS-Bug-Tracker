package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/horatiucrisan/project-service/interfaces"
	"github.com/horatiucrisan/project-service/middleware"
	"github.com/horatiucrisan/project-service/model"
	"github.com/horatiucrisan/project-service/rabbitmq"
	"github.com/horatiucrisan/project-service/schemas"
	"github.com/horatiucrisan/project-service/utils"
)

type projectController struct {
	projectService       interfaces.ProjectService
	userProducer         *rabbitmq.UserProducer
	logProducer          *rabbitmq.ProjectProducer
	notificationProducer *rabbitmq.ProjectProducer
}

func NewProjectController(
	projectService interfaces.ProjectService,
	userProducer *rabbitmq.UserProducer,
	logProducer, notificationProducer *rabbitmq.ProjectProducer,
) interfaces.ProjectController {
	return &projectController{
		projectService:       projectService,
		userProducer:         userProducer,
		logProducer:          logProducer,
		notificationProducer: notificationProducer,
	}
}

// POST methods

func (c *projectController) CreateProject(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID and the request body data
	inputData := schemas.CreateProjectSchema{
		UserID: user.UID,
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to create the project
	project, duration, err := utils.MeasureTime("Create-Project", func() (model.Project, error) {
		return c.projectService.CreateProject(r.Context(), inputData.Title, inputData.Description, inputData.ProjectManagerID, inputData.MemberIDs)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` created a new project `%s`", inputData.UserID, project.ID),
		"audit",
		http.StatusCreated,
		duration,
		project,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) GenerateInvitationLink(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID and the project ID
	inputData := schemas.GenerateInvitationLinkSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to generate the project invitation link
	link, duration, err := utils.MeasureTime("Generate-Invitation-Link", func() (string, error) {
		return c.projectService.GenerateInvitationLink(r.Context(), inputData.ProjectID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` generated a new project invitation link for the proejct `%s`", inputData.UserID, inputData.ProjectID),
		"audit",
		http.StatusCreated,
		duration,
		link,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, link); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// GET methods

func (c *projectController) GetProjects(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Get the number of projects to retrieve and convert it into the int type
	limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnsupportedMediaType)
		return
	}

	// Get the ID of the last project retreived at the previous fetching request
	startAfter := r.URL.Query().Get("startAfter")

	// Validate the data of the request
	inputData := schemas.GetProjectsSchema{
		UserID:         user.UID,
		Limit:          limit,
		OrderBy:        r.URL.Query().Get("orderBy"),
		OrderDirection: r.URL.Query().Get("orderDirection"),
		StartAfter:     &startAfter,
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the projects
	projects, duration, err := utils.MeasureTime("Get-Projects", func() ([]model.Project, error) {
		return c.projectService.GetProjects(r.Context(), inputData.Limit, inputData.OrderBy, inputData.OrderDirection, inputData.StartAfter)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the logs data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` retrieved `%v` projects", inputData.UserID, inputData.Limit),
		"info",
		http.StatusAccepted,
		duration,
		projects,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, projects); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) GetProjectById(w http.ResponseWriter, r *http.Request) {
	// Get the user data based on the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the ID of the user and the Project ID
	inputData := schemas.GetProjectByIdSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the project data
	project, duration, err := utils.MeasureTime("Get-ProjectById", func() (model.Project, error) {
		return c.projectService.GetProjectById(r.Context(), inputData.ProjectID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the project memebers
	membersData, err := c.userProducer.GetUsers(project.MemberIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the project manager
	managersData, err := c.userProducer.GetUsers([]string{project.ProjectManagerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data := model.ReturnData{
		Members:        membersData,
		ProjectManager: managersData[0],
		Data:           project,
	}

	// Generate the log data
	err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer, fmt.Sprintf("User `%s` retrieved project %s", user.UID, project.ID),
		"info",
		http.StatusAccepted,
		duration,
		project,
	)

	// Encode the data into JSON format and return it to the user
	if err = utils.EncodeData(w, r, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) GetUserProjects(w http.ResponseWriter, r *http.Request) {
	// Validate the user data using the context token
	_, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID
	inputData := schemas.GetUserProjectsSchema{
		UserID: chi.URLParam(r, "userId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to retrieve the projects the user is part of
	projects, duration, err := utils.MeasureTime("Get-User-Projects", func() ([]model.Project, error) {
		return c.projectService.GetUserProjects(r.Context(), inputData.UserID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate logs data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` projects retrieved", inputData.UserID),
		"info",
		http.StatusAccepted,
		duration,
		projects,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it

	if err = utils.EncodeData(w, r, projects); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// UPDATE methods

func (c *projectController) UpdateProjectTitle(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID, project ID and the request body data
	inputData := schemas.UpdateProjectTitleSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to udpate the project title
	project, duration, err := utils.MeasureTime("Update-Project-Title", func() (model.Project, error) {
		return c.projectService.UpdateProjectTitle(r.Context(), inputData.ProjectID, inputData.Title)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` updated the title of the project `%s`", inputData.UserID, inputData.ProjectID),
		"audit",
		http.StatusAccepted,
		duration,
		project,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) UpdateProjectDescription(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID, project ID and the request body data
	inputData := schemas.UpdateProjectDescriptionSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the project title
	project, duration, err := utils.MeasureTime("Update-Project-Description", func() (model.Project, error) {
		return c.projectService.UpdateProjectDescription(r.Context(), inputData.ProjectID, inputData.Description)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` updated the description of the project `%s`", inputData.UserID, inputData.ProjectID),
		"audit",
		http.StatusAccepted,
		duration,
		project,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) UpdateProjectManager(w http.ResponseWriter, r *http.Request) {
	// Get the user data from the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID, project ID and the request body data
	inputData := schemas.UpdateProjectManagerSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the project manager
	project, duration, err := utils.MeasureTime("Update-Project-Manager", func() (model.Project, error) {
		return c.projectService.UpdateProjectManager(r.Context(), inputData.ProjectID, inputData.ProjectManagerID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the new project manager
	usersData, err := c.userProducer.GetUsers([]string{inputData.ProjectManagerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` is the new manager of the project `%s`", inputData.ProjectManagerID, inputData.ProjectID),
		"audit",
		http.StatusAccepted,
		duration,
		project,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add the user notification data
	var notificationUsers []model.NotificationUser
	notificationUsers = append(notificationUsers, model.NotificationUser{
		UserID:  usersData[0].ID,
		Email:   usersData[0].Email,
		Message: fmt.Sprintf("You are now the manager of the proejct `%s`", project.Title),
	})

	// Send the notificaiton message to the new project manager
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) AddProjectMembers(w http.ResponseWriter, r *http.Request) {
	// Get the user data from context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID, the project ID and the reqest body data
	inputData := schemas.AddProjectMembersSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to update the project memebers
	project, duration, err := utils.MeasureTime("Add-Project-Members", func() (model.Project, error) {
		return c.projectService.AddProjectMembers(r.Context(), inputData.ProjectID, inputData.MemberIDs)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the new members data
	usersData, err := c.userProducer.GetUsers(inputData.MemberIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` added users `%v` to the project `%s`", inputData.UserID, inputData.MemberIDs, inputData.ProjectID),
		"audit",
		http.StatusAccepted,
		duration,
		project,
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification users data
	var notifiactionUsers []model.NotificationUser
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("You have been added to the project `%s`", project.Title),
		}

		notifiactionUsers = append(notifiactionUsers, notificationUser)
	}

	// Send the notification messages to each user
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notifiactionUsers, "email", project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) RemoveProjectMembers(w http.ResponseWriter, r *http.Request) {
	// Get the user data using the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID the project ID and the request body data
	inputData := schemas.RemoveProjectMembersSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to remove the users from the project
	project, duration, err := utils.MeasureTime("Remove-Project-Members", func() (model.Project, error) {
		return c.projectService.RemoveProjectMembers(r.Context(), inputData.ProjectID, inputData.MemberIDs)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the data of the removed users
	usersData, err := c.userProducer.GetUsers(inputData.MemberIDs)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` removed users `%v` from the project `%s`", inputData.UserID, inputData.MemberIDs, inputData.ProjectID),
		"audit",
		http.StatusAccepted,
		duration,
		"OK",
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification user data
	var notificationUsers []model.NotificationUser
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("You have been removed from project `%s`", project.Title),
		}

		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Send the notification to each user
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (c *projectController) JoinProjectMembers(w http.ResponseWriter, r *http.Request) {
	// Get the user data based on the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID data and the request body data
	// of the user that clicked the invitation link
	inputData := schemas.InvitationLinkSchema{
		UserID: user.UID,
	}

	if err = utils.ValidateBody(r, &inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to add the user to the members list
	project, duration, err := utils.MeasureTime("Join-project-by-link", func() (model.Project, error) {
		return c.projectService.JoinProjectMembers(r.Context(), inputData.UserID, inputData.Code, inputData.Expires)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	managers, err := c.userProducer.GetUsers([]string{project.ProjectManagerID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate log data
	err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` joined the project `%s` using an invitation link", inputData.UserID, project.ID),
		"info",
		http.StatusAccepted,
		duration,
		project,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification data
	var notificationUsers []model.NotificationUser
	notificationUser := model.NotificationUser{
		UserID:  managers[0].ID,
		Email:   managers[0].ID,
		Message: fmt.Sprintf("User `%s` joined project `%s` via invitation link", inputData.UserID, project.Title),
	}
	notificationUsers = append(notificationUsers, notificationUser)

	//notify the project manager
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err = utils.EncodeData(w, r, project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

// DELETE methods

func (c *projectController) DeleteProjectById(w http.ResponseWriter, r *http.Request) {
	// Get the user data using the context token
	user, err := middleware.GetUserFromContext(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Validate the user ID and Project ID
	inputData := schemas.DeleteProjectByIdSchema{
		UserID:    user.UID,
		ProjectID: chi.URLParam(r, "projectId"),
	}

	if err = utils.ValidateParams(inputData); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Send the data to the service layer to delete the project
	project, duration, err := utils.MeasureTime("Delete-ProjectById", func() (model.Project, error) {
		return c.projectService.DeleteProjectById(r.Context(), inputData.ProjectID)
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get the IDs of the project members and project manager
	var userIds []string
	userIds = append(userIds, project.ProjectManagerID)
	userIds = append(userIds, project.MemberIDs...)

	// Get the data of each user
	usersData, err := c.userProducer.GetUsers(userIds)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the log data
	if err = rabbitmq.GenerateLogData(
		w,
		r,
		c.logProducer,
		fmt.Sprintf("User `%s` deleted project `%s`", inputData.UserID, project.ID),
		"audit",
		http.StatusAccepted,
		duration,
		"OK",
	); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate the notification data for each user
	var notificationUsers []model.NotificationUser
	for _, userData := range usersData {
		notificationUser := model.NotificationUser{
			UserID:  userData.ID,
			Email:   userData.Email,
			Message: fmt.Sprintf("Project `%s` has been deleted", project.Title),
		}

		// Add the user notification data to the list
		notificationUsers = append(notificationUsers, notificationUser)
	}

	// Send the notification message to the user
	if err = rabbitmq.GenerateNotificationData(c.notificationProducer, notificationUsers, "email", nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Encode the data into JSON format and return it
	if err = utils.EncodeData(w, r, "OK"); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
