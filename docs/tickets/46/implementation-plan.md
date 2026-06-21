# Implementation Plan: Task CRUD

**Branch**: `001-task-crud` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-task-crud/spec.md`

## Summary

Build the core task management feature: a UI that lists tasks (newest first), allows inline editing of title/status/priority, and deletes tasks behind a confirmation modal. A REST API (`POST /api/tasks`) enables task creation from curl/Postman. All DB operations route through Next.js App Router route handlers. Drizzle ORM manages the PostgreSQL schema. Zod validates every request body at the API boundary.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS (Next.js requirement)

**Primary Dependencies**:
- Next.js 14+ (App Router, route handlers)
- Drizzle ORM + drizzle-kit (schema, migrations)
- postgres (pg driver for Drizzle)
- Zod (request validation at API boundary)
- React 18 (UI, client components for inline editing)
- Vitest + @testing-library/react (integration + component tests)

**Storage**: PostgreSQL (local dev via Docker; test instance for integration tests)

**Testing**: Vitest against a real PostgreSQL test database — no mocks

**Target Platform**: Web browser (UI) + Node.js server (API route handlers)

**Project Type**: Web application (Next.js fullstack)

**Performance Goals**: List load <2s; inline edit reflects in <1s; REST POST response <1s (from spec SC-001–SC-004)

**Constraints**: No auth; demo scale (<100 tasks); no pagination; no real-time sync (last write wins on concurrent edits)

**Scale/Scope**: Single-feature demo; one tasks table; no multi-tenancy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| **I — Tech Stack** | Next.js App Router, Drizzle + PostgreSQL, pnpm, TypeScript strict | ✅ All confirmed in Technical Context |
| **II — Code Quality** | One concern per file; composable components (TaskList → TaskRow → InlineEditField, DeleteConfirmDialog); types in `types/`; shared DB logic in `lib/` | ✅ Project structure enforces this |
| **III — Testing** | Vitest tests hit a real PostgreSQL test instance; no mocks | ✅ Confirmed; test DB required as pre-req |
| **IV — API Design** | GET `/api/tasks`, POST `/api/tasks`, PATCH `/api/tasks/[id]`, DELETE `/api/tasks/[id]` — all curl/Postman reachable; DB calls only in route handlers | ✅ Full REST surface defined |
| **V — Governance** | GitHub issue required before implementation; docs/tickets/ mirrors issue | ⚠ GitHub issue not yet created — MUST be created before tasks phase |
| **VI — Git** | Feature branch `001-task-crud` active; commitlint/husky installed during project setup | ✅ Branch active; tooling setup is Task T001 |
| **VII — Code Review** | PR opened after implementation; review checklist applied before merge | ✅ Deferred to merge phase |

**Gate result**: PASS (with V deferred — GitHub issue creation is Task T002)

## Project Structure

### Documentation (this feature)

```text
specs/001-task-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── tasks-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
app/
├── page.tsx                         # Task list page — composes, does not implement
├── layout.tsx                       # Root layout
└── api/
    └── tasks/
        ├── route.ts                 # GET (list all) + POST (create)
        └── [id]/
            └── route.ts             # PATCH (update) + DELETE (delete)

components/
├── TaskList/
│   ├── TaskList.tsx                 # Renders list of TaskRow; handles empty state
│   ├── TaskRow.tsx                  # Single task row; composes field components
│   ├── InlineEditField.tsx          # Generic editable text field (click-to-edit)
│   ├── StatusSelect.tsx             # Inline status dropdown (todo/in-progress/done)
│   ├── PrioritySelect.tsx           # Inline priority dropdown (low/medium/high)
│   └── DeleteConfirmDialog.tsx      # Modal overlay with Confirm / Cancel

lib/
└── tasks.ts                         # Server-side DB query functions (list, create, update, delete)

types/
└── task.ts                          # Task type + enums with JSDoc

db/
├── schema.ts                        # Drizzle table schema
├── index.ts                         # DB client singleton
└── migrations/                      # drizzle-kit output

tests/
└── integration/
    └── tasks.test.ts                # Real DB: insert/read/update/delete + API route tests
```

**Structure Decision**: Single Next.js App Router project. No separate backend directory — route handlers live under `app/api/`. Components are split by responsibility into `components/TaskList/`. All server-side DB logic is isolated in `lib/tasks.ts` so route handlers stay thin. Types co-locate in `types/task.ts`.

## Complexity Tracking

> No constitution violations requiring justification.
