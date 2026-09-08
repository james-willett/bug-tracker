package handlers

import (
	"bugtracker-backend/internal/db"
	"bugtracker-backend/internal/models"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"bugtracker-backend/internal/testutil"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
)

func TestCreateBug(t *testing.T) {
	os.Setenv("DB_PATH", testutil.GetTestDBPath())
	defer testutil.CleanupTestDB()

	err := db.Init()
	assert.NoError(t, err)
	defer func() {
		db.CleanupTestDB()
		db.Cleanup()
	}()

	tests := []struct {
		name           string
		payload        interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name: "Valid bug creation",
			payload: models.CreateBugRequest{
				Title:       "Test Bug",
				Description: "Test Description",
				Priority:    "High",
				Status:      "Open",
			},
			expectedStatus: http.StatusCreated,
		},
		{
			name: "Invalid bug - missing title",
			payload: models.CreateBugRequest{
				Description: "Test Description",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "title is required",
		},
		{
			name:           "Invalid JSON",
			payload:        `{"invalid": json}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid request body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body bytes.Buffer
			if str, ok := tt.payload.(string); ok {
				body.WriteString(str)
			} else {
				err := json.NewEncoder(&body).Encode(tt.payload)
				assert.NoError(t, err)
			}

			req := httptest.NewRequest("POST", "/api/bugs", &body)
			w := httptest.NewRecorder()

			CreateBug(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				var resp map[string]string
				err := json.NewDecoder(w.Body).Decode(&resp)
				assert.NoError(t, err)
				assert.Contains(t, resp["error"], tt.expectedError)
			} else {
				var bug models.Bug
				err := json.NewDecoder(w.Body).Decode(&bug)
				assert.NoError(t, err)
				assert.NotZero(t, bug.ID)
				assert.NotEmpty(t, bug.CreatedAt)
			}
		})
	}
}

func TestGetBug(t *testing.T) {
	os.Setenv("DB_PATH", testutil.GetTestDBPath())
	defer testutil.CleanupTestDB()

	err := db.Init()
	assert.NoError(t, err)
	defer func() {
		db.CleanupTestDB()
		db.Cleanup()
	}()

	// Create a test bug first
	bug := &models.Bug{
		Title:       "Test Bug",
		Description: "Test Description",
		Priority:    "High",
		Status:      "Open",
	}
	err = db.CreateBug(bug)
	assert.NoError(t, err)

	tests := []struct {
		name           string
		bugID          string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid bug retrieval",
			bugID:          "1",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Non-existent bug",
			bugID:          "999",
			expectedStatus: http.StatusNotFound,
			expectedError:  "bug not found",
		},
		{
			name:           "Invalid bug ID",
			bugID:          "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid bug ID",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/api/bugs/"+tt.bugID, nil)
			w := httptest.NewRecorder()

			// Set up router to handle URL parameters
			router := mux.NewRouter()
			router.HandleFunc("/api/bugs/{id}", GetBug)
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				var resp map[string]string
				err := json.NewDecoder(w.Body).Decode(&resp)
				assert.NoError(t, err)
				assert.Contains(t, resp["error"], tt.expectedError)
			} else {
				var responseBug models.Bug
				err := json.NewDecoder(w.Body).Decode(&responseBug)
				assert.NoError(t, err)
				assert.Equal(t, bug.Title, responseBug.Title)
			}
		})
	}
}

func TestUpdateBug(t *testing.T) {
	os.Setenv("DB_PATH", testutil.GetTestDBPath())
	defer testutil.CleanupTestDB()

	err := db.Init()
	assert.NoError(t, err)
	defer func() {
		db.CleanupTestDB()
		db.Cleanup()
	}()

	bug := &models.Bug{
		Title:       "Original Title",
		Description: "Original Description",
		Priority:    "Low",
		Status:      "Open",
	}
	err = db.CreateBug(bug)
	assert.NoError(t, err)

	tests := []struct {
		name           string
		bugID          string
		payload        interface{}
		expectedStatus int
		expectedError  string
	}{
		{
			name:  "Valid bug update",
			bugID: "1",
			payload: models.CreateBugRequest{
				Title:       "Updated Title",
				Description: "Updated Description",
				Priority:    "High",
				Status:      "In Progress",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:  "Non-existent bug",
			bugID: "999",
			payload: models.CreateBugRequest{
				Title:       "Updated Title",
				Description: "Updated Description",
			},
			expectedStatus: http.StatusNotFound,
			expectedError:  "bug not found",
		},
		{
			name:           "Invalid bug ID",
			bugID:          "invalid",
			payload:        models.CreateBugRequest{},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid bug ID",
		},
		{
			name:           "Invalid JSON",
			bugID:          "1",
			payload:        `{"invalid": json}`,
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid request body",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var body bytes.Buffer
			if str, ok := tt.payload.(string); ok {
				body.WriteString(str)
			} else {
				err := json.NewEncoder(&body).Encode(tt.payload)
				assert.NoError(t, err)
			}

			req := httptest.NewRequest("PUT", "/api/bugs/"+tt.bugID, &body)
			w := httptest.NewRecorder()

			router := mux.NewRouter()
			router.HandleFunc("/api/bugs/{id}", UpdateBug)
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				var resp map[string]string
				err := json.NewDecoder(w.Body).Decode(&resp)
				assert.NoError(t, err)
				assert.Contains(t, resp["error"], tt.expectedError)
			} else {
				var updatedBug models.Bug
				err := json.NewDecoder(w.Body).Decode(&updatedBug)
				assert.NoError(t, err)
				assert.Equal(t, tt.payload.(models.CreateBugRequest).Title, updatedBug.Title)
				assert.Equal(t, tt.payload.(models.CreateBugRequest).Description, updatedBug.Description)
				assert.Equal(t, tt.payload.(models.CreateBugRequest).Priority, updatedBug.Priority)
				assert.Equal(t, tt.payload.(models.CreateBugRequest).Status, updatedBug.Status)
				assert.NotEmpty(t, updatedBug.UpdatedAt)
			}
		})
	}
}

func TestDeleteBug(t *testing.T) {
	os.Setenv("DB_PATH", testutil.GetTestDBPath())
	defer testutil.CleanupTestDB()

	err := db.Init()
	assert.NoError(t, err)
	defer func() {
		db.CleanupTestDB()
		db.Cleanup()
	}()

	bug := &models.Bug{
		Title:       "Test Bug",
		Description: "Test Description",
	}
	err = db.CreateBug(bug)
	assert.NoError(t, err)

	tests := []struct {
		name           string
		bugID          string
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Valid bug deletion",
			bugID:          "1",
			expectedStatus: http.StatusNoContent,
		},
		{
			name:           "Non-existent bug",
			bugID:          "999",
			expectedStatus: http.StatusNotFound,
			expectedError:  "bug not found",
		},
		{
			name:           "Invalid bug ID",
			bugID:          "invalid",
			expectedStatus: http.StatusBadRequest,
			expectedError:  "invalid bug ID",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("DELETE", "/api/bugs/"+tt.bugID, nil)
			w := httptest.NewRecorder()

			router := mux.NewRouter()
			router.HandleFunc("/api/bugs/{id}", DeleteBug)
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedError != "" {
				var resp map[string]string
				err := json.NewDecoder(w.Body).Decode(&resp)
				assert.NoError(t, err)
				assert.Contains(t, resp["error"], tt.expectedError)
			}

			if tt.expectedStatus == http.StatusNoContent {
				idInt, _ := strconv.Atoi(tt.bugID)
				_, err := db.GetBug(idInt)
				assert.Error(t, err)
				assert.Contains(t, err.Error(), "bug not found")
			}
		})
	}
}
