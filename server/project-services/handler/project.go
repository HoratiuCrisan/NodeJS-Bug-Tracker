package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/go-chi/chi/v5"

	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type ProjectObject struct {
	ID             string
	Title          string
	Description    string
	CreationDate   string
	ProjectManager User
	Creator        string
	Members        []User
	Files          []*os.File
	TaskList       []Task
	Code           int
}

type User struct {
	ID          string
	DisplayName string
	Email       string
	Role        string
	PhotoUrl    string
}

type Task struct {
	Title             string
	Description       string
	Response          string
	CreationDate      string
	Deadline          string
	Creator           string
	Handler           string
	Status            string
	Email             string
	HandlerProfileURL *string
	CreatorProfileURL *string
	Files             []*os.File
}

type Notification struct {
	Message   string    `firestore:"message"`
	Read      bool      `firestore:"read"`
	SenderId  string    `firestore:"senderId"`
	Timestamp time.Time `firestore:"timestamp"`
}

type Project struct {
	Client *firestore.Client
	//SocketServer *socketio.Server
}

func (p *Project) Create(w http.ResponseWriter, r *http.Request) {
	/* Defining the project variable */
	var project ProjectObject

	/* Decoding the information sent int the request the body */
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
	}
	/* If there are no problems decoding the project data,
	create a new project with the received information */
	_, _, err := p.Client.Collection("Projects").Add(context.Background(), project)
	if err != nil {
		http.Error(w, "failed to create project", http.StatusInternalServerError)
		return
	}

	go p.sendNotifications(project)

	/* Return success message */
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(project)
}

func (p *Project) List(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	/* Getting all the Projects from the database */
	iter := p.Client.Collection("Projects").Documents(ctx)
	defer iter.Stop() /* Stop the iteration at the end of the method */

	/* Defining the map with all the projects fetched form the database */
	var projects []map[string]interface{}

	for {
		doc, err := iter.Next()
		/*If the next element could not be fetched, stop the iteration */
		if err == iterator.Done {
			break
		}

		/* If there was an error while iterrating the table, return an error */
		if err != nil {
			http.Error(w, "failed to get projects", http.StatusInternalServerError)
			return
		}

		/* Getting the project id from the document name */
		project := doc.Data()
		project["ID"] = doc.Ref.ID
		projects = append(projects, project)
	}

	/* Rerturn the success message with the all the projects fetched form the database */
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

func (p *Project) Delete(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Delete a project")
}

func (p *Project) GetByID(w http.ResponseWriter, r *http.Request) {
	/* Get teh project id from the URL parameters */
	projectID := chi.URLParam(r, "id")

	/* If the url was not passed, send an error message */
	if projectID == "" {
		http.Error(w, "project id is required", http.StatusBadRequest)
		return
	}
	/* Get the project that has the id passed in the URL from the database */
	doc, err := p.Client.Collection("Projects").Doc(projectID).Get(context.Background())

	/* If there was an error while fetching the project, return an error message */
	if err != nil {
		http.Error(w, "failed to fetch project", http.StatusInternalServerError)
		return
	}

	/* If there is no project with the id passed in the URL, return an error message */
	if !doc.Exists() {
		http.Error(w, "project not found", http.StatusNotFound)
		return
	}

	/* If the project data could not be stored in the `project` variable, return an error message */
	var project ProjectObject
	if err := doc.DataTo(&project); err != nil {
		http.Error(w, "failed to parse project data", http.StatusInternalServerError)
		return
	}

	/* Set the project id to the document id (each project's id is the document name) */
	project.ID = doc.Ref.ID

	/* Return success message with the project fetched */
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(project)
}

func (p *Project) UpdateByID(w http.ResponseWriter, r *http.Request) {
	/* Get project id form the URL parameters */
	projectID := chi.URLParam(r, "id")

	/* If the url was not sent, return an error message */
	if projectID == "" {
		http.Error(w, "project ID is required", http.StatusNotFound)
		return
	}

	/* Store the project data from the request body in the following map: */
	var projectData map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&projectData)

	/* If the data could not be decoded, return an error message */
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	/* Update project's data with the data sent inside the request body */
	_, err = p.Client.Collection("Projects").Doc(projectID).Set(context.Background(), projectData, firestore.MergeAll)

	/* If the data could not be updated, return an error message */
	if err != nil {
		http.Error(w, "Failed to update project", http.StatusInternalServerError)
		return
	}

	/* Return success message */
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Project updated successfully"})
}

func (p *Project) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users, err := getAllUsers(p.Client)

	if err != nil {
		http.Error(w, "failed to fetch all users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func getAllUsers(client *firestore.Client) ([]User, error) {
	var users []User

	ctx := context.Background()
	iter := client.Collection("Users").Documents(ctx)

	defer iter.Stop()

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}

		if err != nil {
			return nil, err
		}

		var user User
		if err := doc.DataTo(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (p *Project) sendNotifications(project ProjectObject) {
	notificationMessage := fmt.Sprintf("You have been added to the project: %s", project.Title)

	/* New notification object */
	notification := Notification{
		Message:   notificationMessage,
		Timestamp: time.Now(),
		Read:      false,
		SenderId:  "System",
	}

	if project.ProjectManager.ID != "" {
		err := p.addNotificationForUser(project.ProjectManager.ID, notification)

		/* If the notification could not be added to the project manager return */
		if err != nil {
			return
		}

		/* Notify the project manager */
		//p.SocketServer.BroadcastToRoom("/", "user-"+project.ProjectManager.ID, notificationMessage)
	}

	/* Iterate through the project members and notify each of them */
	for _, member := range project.Members {
		if member.ID == "" {
			continue
		}

		/* Add the notification to the Notifications collection for the members */
		err := p.addNotificationForUser(member.ID, notification)

		/* If the notification could not be added to the Notifications collection exit */
		if err != nil {
			return
		}

		/* Notify the users of the members list */
		//p.SocketServer.BroadcastToRoom("/", "member-"+member.ID, notificationMessage)
	}
}

func (p *Project) addNotificationForUser(userID string, notification Notification) error {
	ctx := context.Background()
	notificationRef := p.Client.Collection("Notifications").Doc(userID)

	// Convert notification struct to a map with appropriate field names
	notificationData := map[string]interface{}{
		"message":   notification.Message,
		"read":      notification.Read,
		"senderId":  notification.SenderId,
		"timestamp": notification.Timestamp,
	}

	// Try to get the existing document
	doc, err := notificationRef.Get(ctx)
	if err != nil {
		// Handle the case where the document doesn't exist
		if status.Code(err) == codes.NotFound {
			// Create a new document with an array containing the first notification
			_, err = notificationRef.Set(ctx, map[string]interface{}{
				"notifications": []map[string]interface{}{notificationData},
			})
			if err != nil {
				return fmt.Errorf("failed to create document: %v", err)
			}
			return nil
		}
		// Return an error if fetching the document failed for other reasons
		return fmt.Errorf("failed to fetch document: %v", err)
	}

	// Document exists, update the notifications array
	var currentData map[string]interface{}
	if err := doc.DataTo(&currentData); err != nil {
		return fmt.Errorf("failed to parse current document data: %v", err)
	}

	// Retrieve existing notifications array or create an empty one if it doesn't exist
	var notifications []map[string]interface{}
	if currentNotifications, ok := currentData["notifications"]; ok {
		if currentNotificationsArr, ok := currentNotifications.([]interface{}); ok {
			for _, n := range currentNotificationsArr {
				if notificationMap, ok := n.(map[string]interface{}); ok {
					notifications = append(notifications, notificationMap)
				}
			}
		}
	}

	// Append the new notification to the existing array
	notifications = append(notifications, notificationData)

	// Update the document with the updated notifications array
	_, err = notificationRef.Set(ctx, map[string]interface{}{
		"notifications": notifications,
	})
	if err != nil {
		return fmt.Errorf("failed to update document: %v", err)
	}

	return nil
}
