# API Contract: Tasks

**Feature**: Task CRUD (`001-task-crud`)
**Base path**: `/api/tasks`
**Content-Type**: `application/json` for all requests and responses.

---

## Task Object (shared response shape)

```json
{
  "id": "uuid",
  "title": "string (1–255 chars)",
  "status": "todo | in-progress | done",
  "priority": "low | medium | high",
  "createdAt": "ISO-8601 timestamp",
  "updatedAt": "ISO-8601 timestamp"
}
```

---

## GET /api/tasks — List All Tasks

Returns all tasks sorted newest first.

### Request

No body. No query parameters.

```bash
curl http://localhost:3000/api/tasks
```

### Response: 200 OK

```json
{
  "tasks": [
    {
      "id": "a1b2c3d4-...",
      "title": "Buy milk",
      "status": "todo",
      "priority": "low",
      "createdAt": "2026-06-21T10:00:00Z",
      "updatedAt": "2026-06-21T10:00:00Z"
    }
  ]
}
```

When no tasks exist:

```json
{ "tasks": [] }
```

---

## POST /api/tasks — Create a Task

### Request Body

| Field | Type | Required | Default |
|---|---|---|---|
| `title` | string (1–255) | ✅ Yes | — |
| `status` | `todo \| in-progress \| done` | No | `todo` |
| `priority` | `low \| medium \| high` | No | `medium` |

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy milk", "priority": "low"}'
```

### Response: 201 Created

```json
{
  "task": {
    "id": "a1b2c3d4-...",
    "title": "Buy milk",
    "status": "todo",
    "priority": "low",
    "createdAt": "2026-06-21T10:00:00Z",
    "updatedAt": "2026-06-21T10:00:00Z"
  }
}
```

### Response: 400 Bad Request (validation failure)

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "title is required and must be 1–255 characters" }
  ]
}
```

---

## PATCH /api/tasks/[id] — Update a Task

Partial update — only supplied fields are changed. At least one field must be present.

### Request Body

| Field | Type | Required |
|---|---|---|
| `title` | string (1–255) | No |
| `status` | `todo \| in-progress \| done` | No |
| `priority` | `low \| medium \| high` | No |

```bash
curl -X PATCH http://localhost:3000/api/tasks/a1b2c3d4-... \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Response: 200 OK

```json
{
  "task": {
    "id": "a1b2c3d4-...",
    "title": "Buy milk",
    "status": "in-progress",
    "priority": "low",
    "createdAt": "2026-06-21T10:00:00Z",
    "updatedAt": "2026-06-21T10:05:00Z"
  }
}
```

### Response: 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "title must be 1–255 characters if provided" }
  ]
}
```

### Response: 404 Not Found

```json
{ "error": "Task not found" }
```

---

## DELETE /api/tasks/[id] — Delete a Task

### Request

No body.

```bash
curl -X DELETE http://localhost:3000/api/tasks/a1b2c3d4-...
```

### Response: 204 No Content

Empty body.

### Response: 404 Not Found

```json
{ "error": "Task not found" }
```

---

## Error Response Shape (all 4xx/5xx)

```json
{
  "error": "Human-readable summary",
  "details": [
    { "field": "fieldName", "message": "specific issue" }
  ]
}
```

`details` is optional — omitted for non-validation errors (404, 500).
