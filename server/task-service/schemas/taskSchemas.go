package schemas

type CreateTaskSchema struct {
	AuthorID    string   `validate:"required"`
	ProjectID   string   `validate:"required"`
	HandlerIDs  []string `validate:"required,dive,required"`
	Description string   `validate:"required"`
	Deadline    int64    `validate:"required"`
}

type CreateSubtaskSchema struct {
	TaskID      string `validate:"required"`
	AuthorID    string `validate:"required"`
	HandlerID   string `validate:"required"`
	Description string `validate:"required"`
}

type CreateTaskResponseSchema struct {
	AuthorID string `validate:"required"`
	TaskID   string `validate:"required"`
	Message  string `validate:"required"`
}

// GET schemas

type GetTasksSchema struct {
	UserID         string  `validate:"required"`
	ProjectID      string  `validate:"required"`
	Limit          int     `validate:"required"`
	OrderBy        string  `validate:"required"`
	OrderDirection string  `validate:"required"`
	StartAfter     *string `validate:"omitempty"`
}

type GetSubtasksSchema struct {
	UserID string `validate:"required"`
	TaskID string `validate:"required"`
}

type GetResponsesSchema struct {
	UserID string `validate:"required"`
	TaskID string `validate:"required"`
}

type GetTaskByIdSchema struct {
	UserID string `validate:"required"`
	TaskID string `validate:"required"`
}

type UpdateTaskDescriptionSchema struct {
	UserID      string `validate:"required"`
	TaskID      string `validate:"required"`
	Description string `validate:"required"`
}

type AddTaskHandlersSchema struct {
	UserID     string   `validate:"required"`
	TaskID     string   `validate:"required"`
	HandlerIDs []string `validate:"required,dive,required"`
}

type RemoveTaskHandlersSchema struct {
	UserID     string   `validate:"required"`
	TaskID     string   `validate:"required"`
	HandlerIDs []string `validate:"required,dive,required"`
}

type UpdateTaskStatusSchema struct {
	UserID string `validate:"required"`
	TaskID string `validate:"required"`
	Status string `validate:"required"`
}

type UpdateSubtaskDescriptionSchema struct {
	UserID      string `validate:"required"`
	TaskID      string `validate:"required"`
	SubtaskID   string `validate:"required"`
	Description string `validate:"required"`
}

type UpdateSubtaskStatusSchema struct {
	UserID    string `validate:"required"`
	TaskID    string `validate:"required"`
	SubtaskID string `validate:"required"`
	Status    bool   `validate:"required"`
}

type UpdateSubtaskHandlerSchema struct {
	UserID    string `validate:"required"`
	TaskID    string `validate:"required"`
	SubtaskID string `validate:"required"`
	HandlerID string `validate:"required"`
}

type UpdateResponseMessageSchema struct {
	UserID     string `validate:"required"`
	TaskID     string `validate:"required"`
	ResponseID string `validate:"required"`
	Message    string `validate:"required"`
}

type DeleteTaskByIdSchema struct {
	UserID string `validate:"required"`
	TaskID string `validate:"required"`
}

type DeleteSubtaskByIdSchema struct {
	UserID    string `validate:"required"`
	TaskID    string `validate:"required"`
	SubtaskID string `validate:"required"`
}

type DeleteResponseById struct {
	UserID     string `validate:"required"`
	TaskID     string `validate:"required"`
	ResponseID string `validate:"required"`
}
