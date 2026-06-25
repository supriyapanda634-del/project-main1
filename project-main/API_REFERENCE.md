# 📡 API Reference Guide

## Overview

The Personal Todo API provides RESTful endpoints for task management. All endpoints return JSON responses.

### Base URL
```
http://localhost:3000/api
```

### Authentication
Currently no authentication required. Add JWT middleware for secure deployment.

### Rate Limiting
- 10 requests per minute per IP address
- Rate limit headers included in responses

### Response Format
All successful responses return JSON with data/message.
Errors return JSON with error description.

---

## Task Endpoints

### 1. List All Tasks
```http
GET /tasks
```

**Description:** Retrieve all tasks sorted by newest first

**Query Parameters:** None

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation",
    "priority": "High",
    "category": "Work",
    "completed": false,
    "dueDate": "2025-01-15",
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T10:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "Medium",
    "category": "Personal",
    "completed": true,
    "dueDate": "2025-01-12",
    "createdAt": "2025-01-09T15:30:00.000Z",
    "updatedAt": "2025-01-10T08:45:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/tasks
```

---

### 2. Create Task
```http
POST /tasks
```

**Description:** Create a new task

**Request Body:**
```json
{
  "title": "Learn TypeScript",
  "description": "Complete TypeScript fundamentals course",
  "priority": "High",
  "category": "Learning",
  "dueDate": "2025-01-20"
}
```

**Required Fields:**
- `title` (string, 1-500 chars)

**Optional Fields:**
- `description` (string, default: "")
- `priority` (string: "Low" | "Medium" | "High", default: "Medium")
- `category` (string, default: "Other")
- `dueDate` (string format: YYYY-MM-DD)

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Learn TypeScript",
  "description": "Complete TypeScript fundamentals course",
  "priority": "High",
  "category": "Learning",
  "completed": false,
  "dueDate": "2025-01-20",
  "createdAt": "2025-01-10T14:20:00.000Z",
  "updatedAt": "2025-01-10T14:20:00.000Z"
}
```

**Error Responses:**
```json
// 400 Bad Request - Missing title
{
  "error": "Invalid task input"
}

// 400 Bad Request - Invalid priority
{
  "error": "Priority must be Low, Medium, or High"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn TypeScript",
    "priority": "High",
    "category": "Learning",
    "dueDate": "2025-01-20"
  }'
```

---

### 3. Update Task
```http
PUT /tasks/:id
```

**Description:** Update an existing task's details

**Path Parameters:**
- `id` (string): Task ID

**Request Body** (all fields optional):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Low",
  "category": "Work",
  "completed": true,
  "dueDate": "2025-01-25"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated title",
  "description": "Updated description",
  "priority": "Low",
  "category": "Work",
  "completed": true,
  "dueDate": "2025-01-25",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T14:30:00.000Z"
}
```

**Error Responses:**
```json
// 404 Not Found
{
  "error": "Task not found."
}

// 400 Bad Request
{
  "error": "Invalid task input"
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/tasks/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "Low",
    "completed": true
  }'
```

---

### 4. Toggle Task Status
```http
PUT /tasks/:id/toggle
```

**Description:** Toggle task completion status (completed ↔ pending)

**Path Parameters:**
- `id` (string): Task ID

**Request Body:** (empty)

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation",
  "priority": "High",
  "category": "Work",
  "completed": true,
  "dueDate": "2025-01-15",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T14:35:00.000Z"
}
```

**Status Flow:**
```
Before: completed: false
Toggle: /api/tasks/:id/toggle
After:  completed: true

Before: completed: true
Toggle: /api/tasks/:id/toggle
After:  completed: false
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/tasks/507f1f77bcf86cd799439011/toggle
```

---

### 5. Delete Task
```http
DELETE /tasks/:id
```

**Description:** Delete a single task

**Path Parameters:**
- `id` (string): Task ID

**Response (200 OK):**
```json
{
  "message": "Task deleted successfully.",
  "deletedCount": 1
}
```

**Error Response:**
```json
// 404 Not Found
{
  "error": "Task not found."
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/507f1f77bcf86cd799439011
```

---

### 6. Clear Completed Tasks
```http
DELETE /tasks/completed
```

**Description:** Delete all completed tasks at once

**Request Body:** (empty)

**Response (200 OK):**
```json
{
  "message": "Completed tasks cleared.",
  "deletedCount": 5
}
```

**Use Cases:**
- Cleanup after periodic review
- Bulk delete without individual requests
- Archive completed work

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/completed
```

---

### 7. Health Check
```http
GET /health
```

**Description:** Verify server and database status

**Response (200 OK):**
```json
{
  "status": "ok",
  "database": "MongoDB Atlas",
  "time": "2025-01-10T14:40:00.000Z"
}
```

**Database Values:**
- `"MongoDB Atlas"` - Connected to MongoDB
- `"Local JSON Storage"` - Using fallback JSON file

**cURL Example:**
```bash
curl http://localhost:3000/api/health
```

---

## Data Types

### Task Object
```typescript
interface Task {
  _id: string;              // Unique identifier (MongoDB ObjectId)
  title: string;            // Task title (required)
  description: string;      // Task details
  priority: string;         // "Low" | "Medium" | "High"
  category: string;         // Task grouping/category
  completed: boolean;       // Completion status
  dueDate?: string;         // Format: YYYY-MM-DD
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

### Priority Levels
| Level | Usage | Example |
|-------|-------|---------|
| Low | Non-urgent tasks | "Read documentation" |
| Medium | Normal priority | "Review pull request" |
| High | Urgent tasks | "Fix critical bug" |

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Server Error - Internal error |

---

## Common Workflows

### Create and Complete a Task
```bash
# 1. Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write documentation",
    "priority": "High"
  }'

# Response includes _id: "507f1f77bcf86cd799439014"

# 2. Mark as completed
curl -X PUT http://localhost:3000/api/tasks/507f1f77bcf86cd799439014/toggle

# 3. Verify completion
curl http://localhost:3000/api/tasks
```

### Filter by Priority
```bash
# Get all tasks (client-side filtering)
curl http://localhost:3000/api/tasks | jq '.[] | select(.priority=="High")'
```

### Update Multiple Fields
```bash
curl -X PUT http://localhost:3000/api/tasks/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New title",
    "description": "New description",
    "priority": "Low",
    "dueDate": "2025-01-30"
  }'
```

---

## Error Handling

### Client-Side Error Handling
```typescript
try {
  const response = await api.post('/tasks', taskData);
  console.log('Task created:', response.data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.error);
    console.error('Status:', error.response.status);
  } else if (error.request) {
    // Request made but no response
    console.error('No response from server');
  } else {
    console.error('Error:', error.message);
  }
}
```

### Common Errors
```json
// Invalid request body
{
  "error": "Invalid task input"
}

// Resource not found
{
  "error": "Task not found."
}

// Rate limit exceeded
{
  "error": "Too many requests"
}

// Server error
{
  "error": "Internal server error",
  "message": "Detailed error information"
}
```

---

## Testing with Postman

### Import Collection
1. Open Postman
2. Create new collection: "Todo API"
3. Add requests with URLs and methods below

### Example Requests Setup
```
Base URL: http://localhost:3000/api

GET /tasks
GET /health
POST /tasks (with JSON body)
PUT /tasks/:id (with JSON body)
PUT /tasks/:id/toggle
DELETE /tasks/:id
DELETE /tasks/completed
```

---

## Performance Tips

### Reduce Response Size
- Request only needed tasks instead of all
- Implement pagination: `/tasks?page=1&limit=10`

### Optimize Queries
- Sort on server side
- Use database indexes
- Cache frequently accessed data

### Rate Limiting
- Current: 10 requests/minute/IP
- Plan accordingly for bulk operations
- Batch operations when possible

---

## API Versioning (Future)

For future API versions:
```
/api/v1/tasks
/api/v2/tasks
```

Maintains backward compatibility while introducing new features.

---

## Migration Examples

### From Custom Solution
```typescript
// Map custom task format to API format
const customTask = { name: 'Task', done: true };
const apiTask = {
  title: customTask.name,
  completed: customTask.done,
  priority: 'Medium'
};
```

### From Different API
```typescript
// Transform third-party task format
const thirdPartyTask = { summary: 'Task', status: 'DONE' };
const apiTask = {
  title: thirdPartyTask.summary,
  completed: thirdPartyTask.status === 'DONE',
  priority: 'Medium'
};
```

---

## Support
For issues or questions about the API, refer to `PROJECT_DOCUMENTATION.md` or check the backend code in `server/routes/taskRoutes.ts`.
