# Bug Tracker Backend API Documentation

This document outlines the available endpoints in the Bug Tracker API.

## Base URL

When running locally: `http://localhost:8081/api`

## Endpoints

### Health Check

```
GET /health
```

Returns the health status of the API.

**Response**
```json
{
    "status": "ok"
}
```

### Bugs

#### Create Bug
```
POST /bugs
```

Create a new bug report.

**Request Body**
```json
{
    "title": "Bug Title",
    "description": "Bug Description",
    "status": "Open",
    "priority": "Medium"
}
```

**Notes:**
- `status` must be one of: "Open", "In Progress", "Closed"
- `priority` must be one of: "Low", "Medium", "High"

**Response**
```json
{
    "id": 1,
    "title": "Bug Title",
    "description": "Bug Description",
    "status": "Open",
    "priority": "Medium",
    "created_at": "2025-02-12T16:11:35Z",
    "updated_at": "2025-02-12T16:11:35Z"
}
```

#### Get All Bugs
```
GET /bugs
```

Retrieve all bugs.

**Response**
```json
[
    {
        "id": 1,
        "title": "Bug Title",
        "description": "Bug Description",
        "status": "Open",
        "priority": "Medium",
        "created_at": "2025-02-12T16:11:35Z",
        "updated_at": "2025-02-12T16:11:35Z"
    }
]
```

#### Get Bug
```
GET /bugs/{id}
```

Retrieve a specific bug by ID.

**Response**
```json
{
    "id": 1,
    "title": "Bug Title",
    "description": "Bug Description",
    "status": "Open",
    "priority": "Medium",
    "created_at": "2025-02-12T16:11:35Z",
    "updated_at": "2025-02-12T16:11:35Z"
}
```

#### Update Bug
```
PUT /bugs/{id}
```

Update an existing bug.

**Request Body**
```json
{
    "title": "Updated Bug Title",
    "description": "Updated Bug Description",
    "status": "In Progress",
    "priority": "High"
}
```

**Response**
```json
{
    "id": 1,
    "title": "Updated Bug Title",
    "description": "Updated Bug Description",
    "status": "In Progress",
    "priority": "High",
    "created_at": "2025-02-12T16:11:35Z",
    "updated_at": "2025-02-12T16:12:35Z"
}
```

#### Delete Bug
```
DELETE /bugs/{id}
```

Delete a specific bug.

**Response**
- Status: 204 No Content

#### Delete All Bugs
```
DELETE /bugs
```

Delete all bugs in the system.

**Response**
```json
{
    "deleted": 5
}
```

### Comments

#### Add Comment
```
POST /bugs/{bugId}/comments
```

Add a comment to a specific bug.

**Request Body**
```json
{
    "content": "Comment content",
    "author": "Author Name"
}
```

**Response**
```json
{
    "id": 1,
    "bug_id": 1,
    "content": "Comment content",
    "author": "Author Name",
    "created_at": "2025-02-12T16:11:35Z"
}
```

#### Get Comments
```
GET /bugs/{bugId}/comments
```

Get all comments for a specific bug.

**Response**
```json
[
    {
        "id": 1,
        "bug_id": 1,
        "content": "Comment content",
        "author": "Author Name",
        "created_at": "2025-02-12T16:11:35Z"
    }
]
```

## Error Responses

The API returns appropriate HTTP status codes and error messages:

- 400 Bad Request - Invalid input
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server error

Error Response Format:
```json
{
    "error": "Error message description"
}
``` 