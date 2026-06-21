# Research: Task CRUD

**Feature**: Task CRUD (`001-task-crud`)
**Date**: 2026-06-21

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## Decision 1 — ORM: Drizzle over Prisma

**Decision**: Drizzle ORM with the `postgres` driver.

**Rationale**:
- Drizzle is SQL-first; the schema is written in TypeScript and generates migrations via `drizzle-kit`. No binary client to manage.
- Type inference is structural — query result types are derived directly from the schema without a separate `generate` step.
- Lighter footprint suits a demo; no Prisma engine binary added to the bundle.
- Constitution names Drizzle as preferred.

**Alternatives considered**:
- Prisma — excellent DX but requires a binary client and a `prisma generate` step after schema changes. Overkill for a demo with one table.

---

## Decision 2 — Validation Library: Zod

**Decision**: Zod for all API boundary validation.

**Rationale**:
- `z.parse()` throws with structured error details that map cleanly to HTTP 400 responses.
- Schema definitions can be placed in `lib/validators/task.ts` and re-used by both route handlers and client-side helpers.
- Zero runtime dependencies beyond itself; tree-shaken in the client bundle when used only on the server.

**Alternatives considered**:
- Manual if/else checks — brittle, not reusable, no structured error output.
- Yup — heavier, less ergonomic TypeScript inference.

---

## Decision 3 — Test Runner: Vitest

**Decision**: Vitest for all integration tests.

**Rationale**:
- Native ESM support aligns with Next.js App Router's module system.
- Fast watch mode; compatible with TypeScript out of the box via `vite`'s transform pipeline.
- `@testing-library/react` integration for component tests when needed.
- Constitution requires real DB tests — Vitest has no opinion on DB; tests call the route handler logic directly against a test PostgreSQL instance (not via HTTP, to avoid spinning up a full server in CI).

**Test database strategy**: Set `DATABASE_URL` to a separate test database (`tasks_test`) in the test environment. Each test file runs `beforeAll` to truncate relevant tables and `afterAll` to clean up. No mocks, no in-memory substitutes.

**Alternatives considered**:
- Jest — slower cold start, ESM support requires additional config with Next.js.
- Playwright — end-to-end only; integration tests are faster and more reliable for DB correctness checks.

---

## Decision 4 — Inline Edit UX Pattern

**Decision**: Controlled-input, click-to-edit pattern per field. Optimistic UI with rollback on error.

**Pattern**:
1. Field renders as display text by default.
2. Single click puts the field into edit mode (replaces display element with `<input>` or `<select>`).
3. On confirm (Enter / blur for text; selection for dropdowns): call `PATCH /api/tasks/[id]`, optimistically update local state, rollback and show inline error if the request fails.
4. On cancel (Escape): restore original value, exit edit mode.

**Rationale**: No separate save button needed; interaction is fast and discoverable. Optimistic update avoids perceived latency. Rollback on network error prevents silent data loss (spec edge case).

**Alternatives considered**:
- Full-row edit mode — shows all fields as editable at once. More complex state; not needed for this scope.
- Save button per row — explicit but slower; the spec calls for inline confirmation via Enter/blur.

---

## Decision 5 — Confirmation Dialog: Custom Modal

**Decision**: Custom React modal component (`DeleteConfirmDialog.tsx`). No third-party dialog library.

**Rationale**:
- Spec explicitly requires a modal overlay (not `window.confirm()`).
- One dialog for one action; a full UI library (Radix, shadcn) adds more than needed for a demo.
- Keeps the component tree transparent and avoids external style systems.
- Accessible: focus trapped inside dialog; Escape closes it (spec acceptance scenario 3 for delete).

**Alternatives considered**:
- Radix UI Dialog — excellent but adds a dependency. Appropriate if the project grows; premature here.
- `window.confirm()` — prohibited by spec assumption.

---

## Decision 6 — State Management: Local React State (no global store)

**Decision**: `useState` / `useOptimistic` (React 18) per component. No Redux, Zustand, or SWR.

**Rationale**:
- Task list is fetched server-side via a Server Component (`app/page.tsx`). Mutations use Client Components with `useOptimistic` for instant feedback and rollback.
- A single list of <100 tasks needs no global store.
- `useOptimistic` is built into React 18 and integrates cleanly with Server Actions or fetch-based mutations.

**Alternatives considered**:
- SWR / React Query — useful for polling and cache invalidation at scale. Not needed for a demo with a small, infrequently changing dataset.
- Zustand — global store adds coordination overhead that single-page task lists don't need.

---

## All Unknowns Resolved

| Unknown | Resolution |
|---|---|
| ORM choice | Drizzle |
| Validation library | Zod |
| Test runner | Vitest + real PostgreSQL test DB |
| Inline edit pattern | Controlled input, optimistic update, rollback |
| Confirmation dialog | Custom React modal |
| State management | Local React state + useOptimistic |
