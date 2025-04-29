package model

import "time"

type Project struct {
	ID               string   `firestore:"id" json:"id"`
	Title            string   `firestore:"title" json:"title"`
	Description      string   `firestore:"description" json:"description"`
	ProjectManagerID string   `firestore:"projectManagerId" json:"projectManagerId"`
	MemberIDs        []string `firestore:"memberIds" json:"memberIds"`
	CreatedAt        int64    `firestore:"createdAt" json:"createdAt"`
	Code             string   `firestore:"code" json:"code"`
}

type Code struct {
	Code string `firestore:"code" json:"code"`
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
