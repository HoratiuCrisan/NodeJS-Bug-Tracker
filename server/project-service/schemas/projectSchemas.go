package schemas

type CreateProjectSchema struct {
	UserID           string   `validate:"required"`
	Title            string   `validate:"required"`
	Description      string   `validate:"required"`
	ProjectManagerID string   `validate:"required"`
	MemberIDs        []string `validate:"required,dive,required"`
}

type GetProjectsSchema struct {
	UserID         string  `validate:"required"`
	Limit          int     `validate:"required"`
	OrderBy        string  `validate:"required"`
	OrderDirection string  `validate:"required"`
	StartAfter     *string `validate:"omitempty"`
}

type GetProjectByIdSchema struct {
	UserID    string `validate:"required"`
	ProjectID string `validate:"required"`
}

type GetUserProjectsSchema struct {
	UserID string `validate:"required"`
}

type UpdateProjectTitleSchema struct {
	UserID    string `validate:"required"`
	ProjectID string `validate:"required"`
	Title     string `validate:"required"`
}

type UpdateProjectDescriptionSchema struct {
	UserID      string `validate:"required"`
	ProjectID   string `validate:"required"`
	Description string `validate:"required"`
}

type UpdateProjectManagerSchema struct {
	UserID           string `validate:"required"`
	ProjectID        string `validate:"required"`
	ProjectManagerID string `validate:"required"`
}

type AddProjectMembersSchema struct {
	UserID    string   `validate:"required"`
	ProjectID string   `validate:"required"`
	MemberIDs []string `validate:"required"`
}

type RemoveProjectMembersSchema struct {
	UserID    string   `validate:"required"`
	ProjectID string   `validate:"required"`
	MemberIDs []string `validate:"required"`
}

type DeleteProjectByIdSchema struct {
	UserID    string `validate:"required"`
	ProjectID string `validate:"required"`
}

type GenerateInvitationLinkSchema struct {
	UserID    string `validate:"required"`
	ProjectID string `validate:"required"`
}

type InvitationLinkSchema struct {
	UserID  string `validate:"required"`
	Code    string `validate:"required" json:"code"`
	Expires int64  `validate:"required" json:"expires"`
}
