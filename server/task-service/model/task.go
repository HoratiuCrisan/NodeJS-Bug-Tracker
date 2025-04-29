package model

import (
	"net/http"

	"firebase.google.com/go/v4/auth"
)

type Task struct {
	ID          string   `firestore:"id" json:"id"`
	AuthorID    string   `firestore:"authorId" json:"authorId"`
	ProjectID   string   `firestore:"projectId" json:"projectId"`
	HandlerIDs  []string `firestore:"handlerIds" json:"handlerIds"`
	Description string   `firestore:"description" json:"description"`
	Status      string   `firestore:"status" json:"status"`
	Deadline    int64    `firestore:"deadline" json:"deadline"`
	CreatedAt   int64    `firestore:"createdAt" json:"createdAt"`
	CompletedAt *int64   `firestore:"completedAt,omitempty" json:"completedAt,omitempty"`
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

type LogMessage struct {
	Request  *http.Request       `firestore:"req" json:"req"`
	Response http.ResponseWriter `firestore:"res" json:"res"`
	Type     string              `firestore:"type" json:"type"`
	Status   int                 `firestore:"status" json:"status"`
	Duration int                 `firestore:"duration" json:"duration"`
	User     *auth.Token         `json:"user"`
	Message  string              `firestore:"message" json:"message"`
	Data     any                 `firestore:"data" json:"data"`
}

type NotificationMessage struct {
	Users []NotificationUser `firestore:"users" json:"users"`
	Type  string             `firetore:"type" josn:"type"`
	Data  any                `firestore:"data" json:"data"`
}

type NotificationUser struct {
	ID      string `firesoter:"userId" json:"userId"`
	Email   string `firestore:"email" json:"email"`
	Message string `firestore:"message" json:"message"`
}

type User struct {
	ID                 string `json:"userId"`
	Eamil              string `json:"email"`
	DisplayName        string `json:"displayName"`
	PhotoURL           string `json:"photoUrl"`
	Role               string `json:"role"`
	LastConnectedAt    *int64 `json:"lastConnectedAt"`
	LastDisconnectedAt *int64 `json:"lastDisconnectedAt"`
}

type TaskCard struct {
	Task  Task   `json:"task"`
	Users []User `json:"users"`
}
