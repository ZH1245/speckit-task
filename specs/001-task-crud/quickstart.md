# Quickstart Validation Guide: Task CRUD

**Feature**: Task CRUD (`001-task-crud`)
**Purpose**: Verify the feature works end-to-end after implementation. Run these steps in order.

---

## Prerequisites

- PostgreSQL running locally (Docker recommended)
- `pnpm` installed
- `.env.local` with `DATABASE_URL` pointing to your dev database
- A separate `DATABASE_URL_TEST` pointing to your test database

---

## 1. Start the App

```bash
pnpm dev
```

App should be reachable at `http://localhost:3000`.

---

## 2. Seed Data via REST (User Story 4)

Create three tasks using curl. Verify each returns HTTP 201 with a full task object (see [API contract](./contracts/tasks-api.md)).

```bash
# Task 1 — defaults
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write unit tests"}'

# Task 2 — explicit status and priority
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Review PR", "status": "in-progress", "priority": "high"}'

# Task 3
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Update docs", "priority": "low"}'
```

**Expected**: Each call returns 201 with an `id`, `createdAt`, `updatedAt` populated by the server.

**Validation error check**:

```bash
# Missing title — expect 400
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"status": "todo"}'

# Invalid status — expect 400
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Bad status", "status": "pending"}'
```

---

## 3. View Task List (User Story 1)

1. Open `http://localhost:3000` in a browser.
2. Verify all 3 seeded tasks appear, newest first.
3. Each row shows: title, status badge, priority indicator.
4. Delete all tasks, reload — verify the empty-state message appears.

**List via curl**:

```bash
curl http://localhost:3000/api/tasks
# Expect: { "tasks": [...] } with 3 items, ordered newest first
```

---

## 4. Inline Edit (User Story 2)

1. Click the title of "Write unit tests".
2. Change it to "Write integration tests", press Enter.
3. Verify the new title appears in the row immediately.
4. Reload the page — verify the change persisted.
5. Click the title again, press Escape — verify the value reverts to "Write integration tests" with nothing saved.
6. Click the title, clear it completely, press Enter — verify an inline validation error appears and the title is NOT saved.
7. Click the status field of any task — verify a dropdown appears with `todo`, `in-progress`, `done`.
8. Select a different status — verify it updates in the row immediately.

**Verify via API after edits**:

```bash
# Replace <id> with the actual task id
curl http://localhost:3000/api/tasks/<id>   # not implemented — use GET /api/tasks and find the task
curl http://localhost:3000/api/tasks
```

---

## 5. Delete with Confirmation (User Story 3)

1. Click the delete control on "Update docs".
2. Verify a modal dialog appears with a clear warning message and Confirm / Cancel buttons.
3. Click Cancel — verify the dialog closes and the task is still in the list.
4. Click the delete control again, then click Confirm.
5. Verify the task disappears from the list immediately.
6. Reload the page — verify the task does not reappear.
7. Verify via curl: `GET /api/tasks` should not include the deleted task.

**Delete via curl**:

```bash
curl -X DELETE http://localhost:3000/api/tasks/<id>
# Expect: 204 No Content

# Delete again — expect 404
curl -X DELETE http://localhost:3000/api/tasks/<id>
```

---

## 6. Run Integration Tests

```bash
DATABASE_URL=$DATABASE_URL_TEST pnpm test
```

All tests MUST pass against the real test database. No test should pass due to mocked responses.

Expected coverage:
- `GET /api/tasks` returns seeded tasks in correct order
- `POST /api/tasks` creates and returns a task with server-assigned fields
- `POST /api/tasks` with invalid body returns 400
- `PATCH /api/tasks/[id]` updates specified fields, leaves others unchanged
- `PATCH /api/tasks/[id]` with empty title returns 400
- `PATCH /api/tasks/[id]` with unknown id returns 404
- `DELETE /api/tasks/[id]` removes the task and returns 204
- `DELETE /api/tasks/[id]` with unknown id returns 404

---

## Done When

- [ ] All curl commands above return expected status codes and shapes
- [ ] UI shows tasks list, inline edits persist, delete requires confirmation
- [ ] Integration test suite passes with zero mocked DB calls
- [ ] `pnpm build` completes with no TypeScript errors
