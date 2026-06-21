# Feature Specification: Task CRUD

**Feature Branch**: `001-task-crud`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "A task app where users can: view a list of tasks, update task attributes inline, and delete a task with a UI confirmation dialog. Tasks are also creatable via REST (POST) for curl/Postman."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Task List (Priority: P1)

A user opens the app and sees all existing tasks displayed as a list. Each row shows the task's title, status, and priority. No task is selected; the list is the default view.

**Why this priority**: Without a task list there is nothing to interact with. Every other story depends on tasks being visible.

**Independent Test**: Seed the database with 3 tasks, open the app, and verify all 3 appear in the list with correct title, status, and priority values.

**Acceptance Scenarios**:

1. **Given** the database contains tasks, **When** the user opens the app, **Then** all tasks are displayed in a list, each showing title, status, and priority.
2. **Given** the database contains no tasks, **When** the user opens the app, **Then** an empty-state message is shown (e.g., "No tasks yet").
3. **Given** the list is displayed, **When** a task's status field is examined, **Then** it reflects the stored value without requiring any user action.

---

### User Story 2 — Inline Edit Task Attributes (Priority: P2)

A user clicks on a field in a task row (title, status, or priority) and edits it in place without navigating to a separate page. The change is persisted when the user confirms (e.g., presses Enter or clicks away).

**Why this priority**: Core value prop of the app. Users need to update tasks without friction.

**Independent Test**: Create one task via REST, open the list, click the title field, change it, confirm, reload the page, and verify the new title persists.

**Acceptance Scenarios**:

1. **Given** a task exists in the list, **When** the user clicks the title field, **Then** the field becomes editable in place (no page navigation).
2. **Given** a field is in edit mode, **When** the user types a new value and confirms, **Then** the updated value is saved and displayed immediately.
3. **Given** a field is in edit mode, **When** the user cancels (e.g., presses Escape), **Then** the original value is restored and nothing is saved.
4. **Given** a user submits an empty title, **When** the save is attempted, **Then** the system rejects the change and displays an inline validation message.
5. **Given** a status field is being edited, **When** the user selects a new status from the allowed values, **Then** the status updates and the list reflects the change without a full page reload.

---

### User Story 3 — Delete Task with Confirmation (Priority: P3)

A user clicks a delete control on a task row. A confirmation dialog appears asking the user to confirm the deletion. If confirmed, the task is removed from the list. If cancelled, nothing changes.

**Why this priority**: Destructive action; confirmation prevents accidental data loss.

**Independent Test**: Create one task via REST, click its delete control, confirm in the dialog, and verify the task no longer appears in the list or in the database.

**Acceptance Scenarios**:

1. **Given** a task exists in the list, **When** the user clicks the delete control, **Then** a confirmation dialog appears with a clear warning and Confirm / Cancel options.
2. **Given** the confirmation dialog is open, **When** the user clicks Confirm, **Then** the task is permanently removed and the list updates immediately.
3. **Given** the confirmation dialog is open, **When** the user clicks Cancel (or presses Escape), **Then** the dialog closes and the task remains in the list unchanged.
4. **Given** a task is deleted, **When** the user refreshes the page, **Then** the deleted task does not reappear.

---

### User Story 4 — Create Task via REST (Priority: P1)

An external caller (curl, Postman, or any HTTP client) sends a POST request with task data and receives a success response containing the created task, including its system-assigned identifier.

**Why this priority**: Tied P1 with viewing — the REST endpoint is the primary way to seed data in this demo and is required by the constitution's API-first principle.

**Independent Test**: Send `POST /api/tasks` with a valid JSON body from curl; verify the response is 201 with the created task object; then open the UI list and confirm the new task appears.

**Acceptance Scenarios**:

1. **Given** a valid POST body (title, status, priority), **When** the request is received, **Then** the system returns HTTP 201 with the created task (including its id and timestamps).
2. **Given** a POST body missing the required `title` field, **When** the request is received, **Then** the system returns HTTP 400 with a descriptive error message.
3. **Given** a POST body with an invalid `status` value, **When** the request is received, **Then** the system returns HTTP 400 identifying the invalid field.
4. **Given** a task is created via REST, **When** the UI list is opened or refreshed, **Then** the new task appears in the list.

---

### Edge Cases

- What happens when two users edit the same task field simultaneously? (Out of scope for this demo — last write wins.)
- What happens when the database is unreachable during a save? The system must surface a clear error message; no silent data loss.
- What happens if a task is deleted while another user is viewing it? (Out of scope for this demo.)
- What happens when the task title exceeds the maximum allowed length? The system must reject the value with an inline validation message before saving.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display all stored tasks in a list view, each row showing title, status, and priority.
- **FR-002**: The system MUST show an empty-state message when no tasks exist.
- **FR-003**: Users MUST be able to edit a task's title, status, and priority directly in the list row without navigating away.
- **FR-004**: The system MUST persist inline edits immediately upon confirmation and reflect the updated value in the list.
- **FR-005**: The system MUST reject a task title that is empty; an inline validation message MUST be shown.
- **FR-006**: Users MUST be able to initiate deletion of a task from the list row.
- **FR-007**: The system MUST present a confirmation dialog before permanently deleting a task.
- **FR-008**: Confirming deletion MUST permanently remove the task; cancelling MUST leave it unchanged.
- **FR-009**: External callers MUST be able to create a task via `POST /api/tasks` with a JSON body.
- **FR-010**: The REST endpoint MUST return HTTP 201 with the full task object (including system-assigned id and timestamps) on success.
- **FR-011**: The REST endpoint MUST return HTTP 400 with a descriptive error when required fields are missing or values are invalid.
- **FR-012**: Tasks created via REST MUST appear in the UI list on next load or refresh.

### Key Entities

- **Task**: The core unit of work. Fields:
  - `id` — system-assigned unique identifier (non-editable)
  - `title` — short description of the work; required; non-empty string; has a maximum length
  - `status` — current state of the task; one of a fixed set of values: `todo`, `in-progress`, `done`
  - `priority` — relative importance; one of: `low`, `medium`, `high`
  - `createdAt` — timestamp when the task was first created (system-assigned, non-editable)
  - `updatedAt` — timestamp of the last modification (system-managed, non-editable by user)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the task list and see all tasks within 2 seconds on a standard connection.
- **SC-002**: A user can edit a task field and see the change reflected in the list within 1 second of confirming.
- **SC-003**: A user can delete a task (including confirming the dialog) in under 5 seconds.
- **SC-004**: A REST `POST /api/tasks` call with a valid body completes and returns a response within 1 second.
- **SC-005**: 100% of invalid REST payloads (missing title, invalid status/priority) receive an HTTP 400 response with a human-readable error message.
- **SC-006**: Zero tasks are deleted without an explicit user confirmation step in the UI.

## Assumptions

- Task list order: tasks are displayed in reverse-chronological order (newest first) by default. No sorting or filtering controls are in scope for this version.
- No pagination for this demo; the full task list is loaded at once. Assumed task count is small (< 100).
- No authentication or authorisation — any user can view, edit, and delete any task. (Constitution explicitly excludes auth for this demo.)
- Maximum title length: 255 characters. This is a reasonable default; can be adjusted if needed.
- Status and priority are constrained to the fixed value sets defined above; free-text values are not allowed.
- The confirmation dialog for deletion is a modal overlay; no browser-native `confirm()` is used.
- Inline editing is triggered by a single click on the editable field.
- Cancelling an inline edit (Escape key or clicking outside the field) discards changes without saving.
