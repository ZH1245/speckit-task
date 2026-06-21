---
description: "Task list for Task CRUD feature implementation"
---

# Tasks: Task CRUD

**Input**: Design documents from `specs/001-task-crud/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/tasks-api.md ✅

**Tests**: Integration tests are included (real PostgreSQL — no mocks per Principle III).

**Organization**: Tasks grouped by user story. Each story is independently implementable and testable.

**Parallel Execution**: Per Principle VIII — `[P]` tasks spawn one sub-agent each. Disjoint file ownership enforced. Dependency order: `types/` → `db/` → `app/api/` → `components/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Next.js project, install all dependencies, configure tooling. No user story work begins until this phase is complete.

- [ ] T001 Scaffold Next.js 14 App Router project into current folder via `pnpm create next-app` (TypeScript, App Router, no Tailwind default — choose plain CSS)
- [ ] T002 Create GitHub issue for this feature via `gh issue create` using ticket format (Title, Summary, Scope, Out of Scope, Acceptance Criteria) and record issue number
- [ ] T003 Create `docs/tickets/<issue-N>/` directory and copy `specs/001-task-crud/plan.md` to `docs/tickets/<issue-N>/implementation-plan.md`
- [ ] T004 Install runtime deps: `pnpm add drizzle-orm postgres zod`
- [ ] T005 [P] Install dev deps: `pnpm add -D drizzle-kit @types/node vitest @vitejs/plugin-react @testing-library/react @testing-library/dom`
- [ ] T006 [P] Install commit-lint tooling: `pnpm add -D commitlint @commitlint/config-conventional husky` then run `pnpm exec husky init` and add `.husky/commit-msg` hook invoking `commitlint`
- [ ] T007 Create `commitlint.config.js` at repo root extending `@commitlint/config-conventional`
- [ ] T008 Create `vitest.config.ts` at repo root configured for TypeScript and React Testing Library

**Checkpoint**: `pnpm dev` runs without error; `pnpm test` runs (zero tests pass yet — that is correct).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, DB schema, and DB client — every user story depends on these. MUST be complete before any story work begins.

**⚠️ CRITICAL**: No user story implementation may start until this phase is committed and `pnpm build` is clean.

- [ ] T009 Create `types/task.ts` with `Task`, `TaskStatus`, `TaskPriority`, `CreateTaskInput`, `UpdateTaskInput` interfaces exactly as specified in `specs/001-task-crud/data-model.md` — full JSDoc on every exported field and function (Principle II)
- [ ] T010 Create `db/schema.ts` with the Drizzle `tasks` table definition from `specs/001-task-crud/data-model.md` (uuid PK, varchar title 255, text status default `todo`, text priority default `medium`, timestamptz createdAt/updatedAt with `defaultNow()`)
- [ ] T011 Create `db/index.ts` exporting a singleton Drizzle client using the `postgres` driver and `DATABASE_URL` env var
- [ ] T012 Generate initial migration: run `pnpm drizzle-kit generate` and commit the output under `db/migrations/`
- [ ] T013 Create `.env.local.example` documenting `DATABASE_URL` and `DATABASE_URL_TEST` (no real credentials)
- [ ] T014 Create `lib/tasks.ts` with server-side query functions: `listTasks()`, `createTask(input)`, `updateTask(id, input)`, `deleteTask(id)` — JSDoc on each; all functions use `db/index.ts`; no direct DB calls anywhere else (Principle IV)

**Checkpoint**: `pnpm build` clean (TypeScript errors = 0). Migration file exists. `lib/tasks.ts` compiles.

---

## Phase 3: User Story 4 — Create Task via REST (Priority: P1) 🎯 MVP Start

**Goal**: `POST /api/tasks` works end-to-end from curl — creates a task and returns HTTP 201 with full task object.

**Why P1 first**: REST create is the data entry point for all other stories. Without it no tasks exist to view/edit/delete.

**Independent Test**: `curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"smoke test"}' ` returns 201 with id, createdAt, updatedAt.

### Integration Tests for US4 (write first, verify they FAIL before T017)

- [ ] T015 [P] [US4] Write integration test for `POST /api/tasks` valid body → 201 + full task object in `tests/integration/tasks-create.test.ts` (real DB, no mocks)
- [ ] T016 [P] [US4] Write integration test for `POST /api/tasks` missing title → 400 and invalid status → 400 in `tests/integration/tasks-create.test.ts`

### Implementation for US4

- [ ] T017 [US4] Create Zod validation schema `createTaskSchema` in `lib/validators/task.ts` (title required 1–255, status optional enum, priority optional enum)
- [ ] T018 [US4] Create `app/api/tasks/route.ts` with `POST` handler: parse body with `createTaskSchema`, call `lib/tasks.ts#createTask`, return 201 `{ task }` or 400 `{ error, details }` (Principle II, IV)

**Checkpoint**: T015–T016 tests now pass against real test DB. `curl POST` returns 201.

---

## Phase 4: User Story 1 — View Task List (Priority: P1) 🎯 MVP

**Goal**: Opening the app shows all tasks newest-first; empty state shown when no tasks exist.

**Independent Test**: Seed 3 tasks via REST, open `http://localhost:3000`, verify all 3 appear with correct title/status/priority. Delete all tasks, reload — empty state visible.

### Integration Tests for US1 (write first, verify they FAIL before T021)

- [ ] T019 [P] [US1] Write integration test for `GET /api/tasks` returns all tasks ordered newest-first in `tests/integration/tasks-list.test.ts` (real DB)
- [ ] T020 [P] [US1] Write integration test for `GET /api/tasks` returns `{ tasks: [] }` when DB empty in `tests/integration/tasks-list.test.ts`

### Implementation for US1

- [ ] T021 [US1] Add `GET` handler to `app/api/tasks/route.ts`: call `lib/tasks.ts#listTasks`, return 200 `{ tasks }` sorted by `createdAt DESC`
- [ ] T022 [P] [US1] Create `components/TaskList/TaskList.tsx` — renders list of `TaskRow` components; shows empty-state message when `tasks` prop is empty; no logic beyond rendering (Principle II)
- [ ] T023 [P] [US1] Create `components/TaskList/TaskRow.tsx` — renders one task row with title, status badge, priority indicator; accepts `task: Task` prop; placeholder click handlers (wired in US2)
- [ ] T024 [US1] Update `app/page.tsx` (Server Component) to fetch tasks via `GET /api/tasks`, pass array to `<TaskList />`

**Checkpoint**: T019–T020 pass. Browser shows task list populated from DB; empty state displays when no tasks exist.

---

## Phase 5: User Story 2 — Inline Edit Task Attributes (Priority: P2)

**Goal**: Clicking a task field (title, status, priority) in the list opens an inline editor; confirming saves the change; Escape reverts; empty title is rejected with inline error.

**Independent Test**: Create task via REST, click title, change it, press Enter, reload page — new title persists. Press Escape during edit — original value restored.

### Integration Tests for US2 (write first, verify they FAIL before T028)

- [ ] T025 [P] [US2] Write integration test for `PATCH /api/tasks/[id]` valid partial update → 200 + updated task in `tests/integration/tasks-update.test.ts`
- [ ] T026 [P] [US2] Write integration test for `PATCH /api/tasks/[id]` empty title → 400; unknown id → 404 in `tests/integration/tasks-update.test.ts`

### Implementation for US2

- [ ] T027 [US2] Create Zod validation schema `updateTaskSchema` in `lib/validators/task.ts` (all fields optional; title min 1 if present; status/priority enum if present; at least one field required)
- [ ] T028 [US2] Create `app/api/tasks/[id]/route.ts` with `PATCH` handler: parse body with `updateTaskSchema`, call `lib/tasks.ts#updateTask`, return 200 `{ task }` or 400/404 (Principle II, IV)
- [ ] T029 [P] [US2] Create `components/TaskList/InlineEditField.tsx` — generic click-to-edit text input; props: `value`, `onSave(newValue)`, `onCancel()`; shows inline error when value is empty; Enter confirms, Escape cancels (Principle II)
- [ ] T030 [P] [US2] Create `components/TaskList/StatusSelect.tsx` — inline `<select>` for `todo | in-progress | done`; calls `onSave(newStatus)` on change (Principle II)
- [ ] T031 [P] [US2] Create `components/TaskList/PrioritySelect.tsx` — inline `<select>` for `low | medium | high`; calls `onSave(newPriority)` on change (Principle II)
- [ ] T032 [US2] Update `components/TaskList/TaskRow.tsx` to wire `InlineEditField`, `StatusSelect`, `PrioritySelect`; implement optimistic update via `useOptimistic`; call `PATCH /api/tasks/[id]`; rollback + show error on failure

**Checkpoint**: T025–T026 pass. Inline edits persist after page reload. Escape reverts. Empty title shows validation error.

---

## Phase 6: User Story 3 — Delete Task with Confirmation (Priority: P3)

**Goal**: Clicking delete opens a modal confirmation; Confirm removes the task; Cancel closes the modal with no change.

**Independent Test**: Create task via REST, click delete, confirm, task gone from list. Click delete on another task, press Escape — task still present.

### Integration Tests for US3 (write first, verify they FAIL before T036)

- [ ] T033 [P] [US3] Write integration test for `DELETE /api/tasks/[id]` → 204 + task absent from DB in `tests/integration/tasks-delete.test.ts`
- [ ] T034 [P] [US3] Write integration test for `DELETE /api/tasks/[id]` unknown id → 404 in `tests/integration/tasks-delete.test.ts`

### Implementation for US3

- [ ] T035 [US3] Add `DELETE` handler to `app/api/tasks/[id]/route.ts`: call `lib/tasks.ts#deleteTask`, return 204 or 404 (Principle II, IV)
- [ ] T036 [US3] Create `components/TaskList/DeleteConfirmDialog.tsx` — modal overlay; props: `taskTitle`, `onConfirm()`, `onCancel()`; Escape key triggers `onCancel`; focus trapped inside dialog; no `window.confirm()` (Principle II)
- [ ] T037 [US3] Update `components/TaskList/TaskRow.tsx` to add delete button; wire `DeleteConfirmDialog`; on confirm call `DELETE /api/tasks/[id]`; remove task from list on success

**Checkpoint**: T033–T034 pass. Delete flow requires modal confirmation. Escape and Cancel both leave task intact.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, validation, and review-gate compliance across all stories.

- [ ] T038 [P] Verify all exported functions in `lib/tasks.ts`, `types/task.ts`, `lib/validators/task.ts` have JSDoc (Principle II)
- [ ] T039 [P] Verify no direct DB calls exist outside `lib/tasks.ts` and `app/api/` (grep check — Principle IV)
- [ ] T040 [P] Verify `app/page.tsx` contains no business logic; only imports and renders `<TaskList />` (Principle II)
- [ ] T041 Run full integration test suite: `DATABASE_URL=$DATABASE_URL_TEST pnpm test` — all tests MUST pass against real DB (Principle III)
- [ ] T042 Run `pnpm build` — zero TypeScript errors (Principle I)
- [ ] T043 Manual smoke test per `specs/001-task-crud/quickstart.md` — all curl commands + UI flows pass
- [ ] T044 Update GitHub issue (created in T002) with final status; confirm `docs/tickets/<issue-N>/implementation-plan.md` matches current plan (Principle V)
- [ ] T045 Open Pull Request via `gh pr create` linking the GitHub issue; PR description restates Acceptance Criteria as checkboxes (Principle VII)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T005 and T006 are `[P]`.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. T009–T014 MUST run sequentially (schema → client → migration → query functions). Blocks all user stories.
- **US4 — REST Create (Phase 3)**: Depends on Phase 2. Tests written first (T015–T016 `[P]`), then validator (T017), then route (T018).
- **US1 — View List (Phase 4)**: Depends on Phase 2 (needs `lib/tasks.ts`) and US4 (needs tasks to exist). T019–T020 `[P]`, T022–T023 `[P]`.
- **US2 — Inline Edit (Phase 5)**: Depends on Phase 2 and US1 (TaskRow exists). T025–T026 `[P]`, T029–T031 `[P]`.
- **US3 — Delete (Phase 6)**: Depends on Phase 2 and US1 (TaskRow exists). T033–T034 `[P]`, T036 independent.
- **Polish (Phase 7)**: Depends on all user stories complete. T038–T040 `[P]`.

### Dependency order enforced (Principle VIII)

```
types/task.ts (T009)
  → db/schema.ts (T010) → db/index.ts (T011) → db/migrations/ (T012)
    → lib/tasks.ts (T014)
      → app/api/tasks/route.ts (T018, T021)
      → app/api/tasks/[id]/route.ts (T028, T035)
        → components/TaskList/* (T022, T023, T029–T032, T036–T037)
          → app/page.tsx (T024)
```

### Within US2 — Parallel Opportunities

```bash
# Spawn simultaneously (disjoint files per Principle VIII):
Agent A → T029 InlineEditField.tsx
Agent B → T030 StatusSelect.tsx
Agent C → T031 PrioritySelect.tsx
# Wait for all three → verify diffs → run test suite → then T032
```

### Within US3 — Parallel Opportunities

```bash
# Spawn simultaneously:
Agent A → T033 tasks-delete.test.ts (create test)
Agent B → T034 tasks-delete.test.ts (404 test)  # same file → MERGE into one task
# Correction: T033 and T034 share tests/integration/tasks-delete.test.ts → already merged above into two entries in same file; one agent handles both sequentially within that file.
Agent C → T036 DeleteConfirmDialog.tsx (independent)
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3 + 4 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US4 — REST Create (data entry point)
4. Complete Phase 4: US1 — View List
5. **STOP and VALIDATE**: `curl POST` creates tasks; browser shows them. That's a working demo.

### Incremental Delivery

1. Phases 1–4 → working task list with REST seeding (MVP demo)
2. Phase 5 → inline editing without page reload
3. Phase 6 → safe deletion with confirmation
4. Phase 7 → hardened, PR-ready

### Parallel Agent Strategy (Principle VIII)

| Batch | Agents | Tasks |
|---|---|---|
| Batch 1 (Setup) | 2 agents | T005 (dev deps) ‖ T006 (husky/commitlint) |
| Batch 2 (US4 tests) | 2 agents | T015 ‖ T016 (different test cases, same file — merge: 1 agent) |
| Batch 3 (US1 impl) | 2 agents | T022 (TaskList) ‖ T023 (TaskRow) |
| Batch 4 (US1 tests) | 2 agents | T019 ‖ T020 (same file — 1 agent) |
| Batch 5 (US2 components) | 3 agents | T029 (InlineEditField) ‖ T030 (StatusSelect) ‖ T031 (PrioritySelect) |
| Batch 6 (US2 tests) | 1 agent | T025 + T026 (same file) |
| Batch 7 (US3) | 2 agents | T033+T034 (1 agent, same file) ‖ T036 (DeleteConfirmDialog) |
| Batch 8 (Polish) | 3 agents | T038 ‖ T039 ‖ T040 |

Full test suite runs after each batch before the next starts (Principle VIII).

---

## Notes

- `[P]` = disjoint files, safe to run concurrently with other `[P]` tasks in the same batch (Principle VIII)
- Story label maps each task to its user story for traceability
- Integration tests MUST be written and confirmed failing BEFORE implementation in each story
- Migrations (T012) always sequential — never parallel (Principle VIII)
- T002 (GitHub issue) and T003 (docs/tickets mirror) are governance requirements (Principle V) — not optional
