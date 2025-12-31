package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"bugtracker-backend/internal/db"
	"bugtracker-backend/internal/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("Starting Bug Tracker backend server...")

	if err := db.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Cleanup()

	// Create the production server
	srv := createServer()

	// Channel to listen for errors coming from the listener
	serverErrors := make(chan error, 1)

	// Start the server
	go func() {
		log.Printf("Server starting on port %s...\n", srv.Addr)
		serverErrors <- srv.ListenAndServe()
	}()

	// Channel to listen for an interrupt or terminate signal from the OS
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	// Blocking main and waiting for shutdown
	select {
	case err := <-serverErrors:
		log.Fatalf("Error starting server: %v", err)

	case sig := <-shutdown:
		log.Printf("Received signal %v: initiating shutdown", sig)

		// Give outstanding requests a deadline for completion
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		// Asking listener to shut down and shed load
		if err := srv.Shutdown(ctx); err != nil {
			log.Printf("Graceful shutdown did not complete in %v: %v", 10*time.Second, err)
		} else {
			log.Println("Server shut down gracefully.")
		}
	}
}

// Production server creation
func createServer() *http.Server {
	r := mux.NewRouter()

	// Apply CORS middleware to all routes
	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://bugtracker-staging-jameswillett.fly.dev",
			"https://bugtracker-jameswillett.fly.dev",
		},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
		ExposedHeaders: []string{"Content-Length"},
		AllowCredentials: true,
	})

	// Wrap the router with CORS middleware
	handler := c.Handler(r)

	// Register all routes
	r.HandleFunc("/api/health", handlers.HealthCheck).Methods("GET")
	apiRouter := r.PathPrefix("/api").Subrouter()
	handlers.RegisterRoutes(apiRouter)

	log.Printf("Starting server on :8081")
	return &http.Server{
		Addr:    "0.0.0.0:8081",
		Handler: handler,
	}
}
