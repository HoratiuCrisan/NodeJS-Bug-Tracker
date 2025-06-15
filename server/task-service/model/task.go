package model

import (
	"time"
)

type Task struct {
	ID                    string   `firestore:"id" json:"id"`
	AuthorID              string   `firestore:"authorId" json:"authorId"`
	ProjectID             string   `firestore:"projectId" json:"projectId"`
	HandlerIDs            []string `firestore:"handlerIds" json:"handlerIds"`
	Description           string   `firestore:"description" json:"description"`
	Status                string   `firestore:"status" json:"status"`
	Deadline              int64    `firestore:"deadline" json:"deadline"`
	CreatedAt             int64    `firestore:"createdAt" json:"createdAt"`
	CompletedAt           *int64   `firestore:"completedAt,omitempty" json:"completedAt,omitempty"`
	SubtaskCount          int64    `firestore:"subtaskCount" json:"subtaskCount"`
	ResponseCount         int64    `firestore:"responseCount" json:"responseCount"`
	CompletedSubtaskCount int64    `firestore:"completedSubtaskCount" json:"completedSubtaskCount"`
}

type Subtask struct {
	ID          string `firestore:"id" json:"id"`
	TaskID      string `firestore:"taskId" json:"taskId"`
	AuthorID    string `firestore:"authorId" json:"authorId"`
	HandlerID   string `firestore:"handlerId" json:"handlerId"`
	Description string `firestore:"description" json:"description"`
	CreatedAt   int64  `firestore:"createdAt" json:"createdAt"`
	Done        bool   `firestore:"done" json:"done"`
}

type Response struct {
	ID        string `firestore:"id" json:"id"`
	AuthorID  string `firestore:"authorId" json:"authorId"`
	TaskID    string `firestore:"taskId" json:"taskId"`
	Message   string `firestore:"message" json:"message"`
	Timestamp int64  `firestore:"timestamp" json:"timestamp"`
}

type User struct {
	ID                 string `firestore:"id" json:"id"`
	Email              string `firestore:"email" json:"email"`
	DisplayName        string `firestore:"displayName" json:"displayName"`
	PhotoURL           string `firestore:"photoUrl" json:"photoUrl"`
	Role               string `firestore:"role" json:"role"`
	LastConnectedAt    *int64 `firestore:"lastConnectedAt" json:"lastConnectedAt"`
	LastDisconnectedAt *int64 `firestore:"lastDisconnectedAt" json:"lastDisconnectedAt"`
}

type ReturnData struct {
	Members        []User `json:"members"`
	ProjectManager User   `json:"projectManager"`
	Data           any    `json:"data"`
}

type LogMessage struct {
	ID             string         `firestore:"id" json:"id"`
	Type           string         `firestore:"type" json:"type"`
	Timestamp      int64          `firestore:"timestamp" json:"timestamp"`
	Message        string         `firestore:"message" json:"message"`
	RequestDetails RequestDetails `firestore:"requestDetails" json:"requestDetails"`
	User           User           `firestore:"user" json:"user"`
	Data           any            `firestore:"data" json:"data"`
}

type RequestDetails struct {
	Method   string        `firestore:"method" json:"method"`
	Endpoint string        `firestore:"endpoint" json:"endpoint"`
	Status   int           `firestore:"status" json:"status"`
	Duration time.Duration `firestore:"duration" json:"duration"`
}

type NotificationMessage struct {
	UserID  string  `firestore:"userId" json:"userId"`
	Email   *string `firestore:"email" json:"email"`
	Message string  `firestore:"message" json:"message"`
	Type    string  `firestore:"type" json:"type"`
	Data    any     `firestore:"data" json:"data"`
}

type NotificationUser struct {
	UserID  string `firestore:"userId" json:"userId"`
	Email   string `firestore:"email" json:"email"`
	Message string `firestore:"message" json:"message"`
}

type TaskCard struct {
	Task  Task   `json:"task"`
	Users []User `json:"users"`
}

type DataVersion struct {
	ID        string `firestore:"id" json:"id"`
	Type      string `firestore:"type" json:"type"`
	Timestamp int64  `firestore:"timestamp" json:"timestamp"`
	Data      any    `firestore:"data" json:"data"`
}

type EncodedResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}
