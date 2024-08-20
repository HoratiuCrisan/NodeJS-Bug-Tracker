package application

import (
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/bug-tracking/projects-api/handler"
)

func loadRoutes(client *firestore.Client, jwtKey []byte) *chi.Mux {
	router := chi.NewRouter()

	corsOptions := cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // specify the allowed origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}
	router.Use(cors.Handler(corsOptions))

	router.Use(middleware.Logger)
	//router.Use(auth.JwtAuth(jwtKey))

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	router.Route("/projects", func(r chi.Router) {
		loadProjectRouter(r, client)
	})

	return router
}

func loadProjectRouter(router chi.Router, client *firestore.Client) {
	projectHandler := &handler.Project{Client: client}

	router.Post("/", projectHandler.Create)
	router.Get("/", projectHandler.List)
	router.Get("/{id}", projectHandler.GetByID)
	router.Put("/{id}", projectHandler.UpdateByID)
	router.Delete("/{id}", projectHandler.Delete)

	router.Get("/users", projectHandler.GetAllUsers)
}
