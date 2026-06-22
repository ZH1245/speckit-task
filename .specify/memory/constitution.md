<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0 (MINOR — two new principles added)
Modified principles: none (I–V unchanged)
Added sections:
  - VI. Git & Version Control
  - VII. Code Review
  - Governance table: "Commit" row added, "Review" row strengthened to ref VII
Removed sections: none
Templates reviewed:
  - .specify/templates/plan-template.md      ✅ Constitution Check section present; compatible
  - .specify/templates/spec-template.md      ✅ No changes required
  - .specify/templates/tasks-template.md     ✅ No changes required
  - .specify/templates/checklist-template.md ✅ No changes required
Deferred TODOs: none
-->

# Task Management App Constitution

## Core Principles

### I. Tech Stack (NON-NEGOTIABLE)

- Framework: Next.js with App Router. Backend logic lives exclusively in route handlers under `app/api/`. No API logic in React Server Components.
- ORM: Drizzle (preferred) or Prisma. Database: PostgreSQL.
- Package manager: **pnpm only**. Add dependencies via `pnpm add <name>` with no pinned version unless resolving a real conflict. Never hand-write `package.json` dependency versions. Scaffold new projects via official generators (e.g. `pnpm create next-app`) **into the current folder**, never a subfolder.
- Language: TypeScript throughout. No `any`; use `unknown` + narrowing or discriminated unions.

**Rationale**: Locked stack eliminates per-feature tooling debates and ensures every contributor works from the same mental model.

### II. Code Quality (NON-NEGOTIABLE)

- **Single Responsibility**: one concern per file. When a file does two unrelated things, split it.
- **Composable components**: UI built from small, focused child components. No monolith pages. Pages compose; they do not implement.
- **No duplication**: shared UI logic lives in `lib/` or `helpers/`, imported everywhere it is needed — never copy-pasted.
- **Canonical types**: all shared types live in `types/`. Every exported type field MUST carry a JSDoc comment so IDEs surface intellisense. Every exported function MUST carry a JSDoc comment explaining its purpose and parameters.
- **Comments explain WHY**: a comment MUST capture a non-obvious constraint, subtle invariant, or deliberate workaround. Comments that restate what well-named code already says MUST NOT be written.
- **Input validation at the API boundary**: every route handler validates its request body/params before touching the database. Auth is out of scope for this demo.

**Rationale**: These rules keep the codebase navigable as features accumulate and prevent the copy-paste drift that kills demo projects.

### III. Testing (NON-NEGOTIABLE)

- **Real tests only**: every test MUST exercise actual database inserts, reads, and deletes against a real (or dedicated test) PostgreSQL instance. Mocked or fake database assertions are prohibited — they prove nothing about real behavior.
- Test files live alongside source in a co-located `__tests__/` directory or under a top-level `tests/` folder, as determined per feature plan.

**Rationale**: A demo with mocked tests is a demo that lies about its own correctness.

### IV. API Design (NON-NEGOTIABLE)

- Every resource action MUST be reachable via REST from `curl` or Postman without touching the UI. Example: `POST /api/tasks` creates a task.
- Route handlers under `app/api/` are the only place where database reads and writes occur. No direct DB calls from React components or pages.
- HTTP semantics MUST be respected: `GET` reads, `POST` creates, `PATCH`/`PUT` updates, `DELETE` removes. Status codes MUST match the outcome.

**Rationale**: UI-only coupling makes features impossible to test in isolation and blocks future integrations.

### V. Workflow & Ticket Governance (NON-NEGOTIABLE)

- **Search before creating**: before writing any spec, plan, task list, or implementation, search the repo for existing related code. Build on it — never duplicate existing functionality.
- **GitHub is the source of truth**: every feature MUST have a GitHub issue created via `gh`. Ticket format:
  - **Title** (concise, imperative)
  - **Summary**: one-paragraph description of what and why.
  - **Scope**: explicit list of what is included.
  - **Out of Scope**: explicit list of what is excluded.
  - **Acceptance Criteria**: numbered, testable statements.
- **docs/ mirrors tickets**: `docs/tickets/<N>/` holds the ticket's current state. `docs/tickets/<N>/implementation-plan.md` holds the agreed plan. GitHub issues and `docs/` MUST stay in sync — update both whenever either changes.

**Rationale**: Tickets prevent scope creep and make the demo's progress legible to anyone who clones the repo.

### VI. Git & Version Control (NON-NEGOTIABLE)

- **Conventional Commits**: every commit MUST follow `type(scope): subject`. Subject ≤50 chars, imperative mood. Allowed types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- **Commit messages capture WHY**: the diff shows what changed; the message explains the reason. Body only when reasoning is non-obvious.
- **One logical change per commit**: unrelated changes MUST NOT be mixed. Each Spec Kit phase (constitution, specify, plan, tasks, implement) produces its own commit so history reads as a clean timeline.
- **Named staging only**: never `git add -A` or `git add .`. Stage files by name to prevent secrets or build artifacts from leaking into history.
- **No AI co-author trailers**: commit messages MUST NOT include `Co-Authored-By: Claude ...` or any equivalent AI authorship metadata.
- **Feature branches**: every feature is built on its own branch (e.g. `001-task-list`). Direct commits to `main` are prohibited.
- **Push policy**: push feature branches to the remote and open a Pull Request to merge into `main`. Never push straight to `main`. Never force-push a shared branch.
- **Merge strategy**: squash-merge each PR into `main` so every feature lands as one clean commit. Because a squash drops the PR body, the `Closes #N` keyword does NOT reach `main` — after a squash merge, explicitly close the linked issue (`gh issue close N`) or use a regular merge when auto-close is required.
- **Branch cleanup**: delete the feature branch immediately after its PR merges (`gh pr merge --delete-branch`, or `git push origin --delete <branch>`). No stale merged branches left on the remote.
- **Prefer shallow, independent PRs**: branch each task off `main` whenever the task's files are disjoint from other in-flight work. Avoid deep PR stacks (a branch based on another unmerged branch). Stacks force a fixed merge order and cause conflict cascades when collapsed.
- **Stacked PRs merge bottom-up, in dependency order**: when a stack is unavoidable, merge the base PR first and each dependent only after its base is on `main`. NEVER retarget dependents to `main` and squash them out of order — it rewrites history under the others and produces conflicts. If a conflict needs real judgment, STOP and resolve deliberately; do not blind-resolve.

**Rationale**: Clean, traceable history makes code review, bisect, and rollback reliable. Naming staged files prevents credential leaks. Shallow independent PRs merge in any order; deep stacks do not, and collapsing them out of order is the single most common cause of an avoidable conflict storm.

### VII. Code Review (NON-NEGOTIABLE)

- Every change reaches `main` through a Pull Request. Direct merges without review are prohibited.
- The PR description MUST link its GitHub issue and restate Acceptance Criteria as a checkbox list.
- **Review gate** — a PR is approved only when ALL of the following hold:
  - Real DB integration tests pass (Principle III); no mocked tests present.
  - No monolith components; no copy-pasted logic (Principle II).
  - Every API action is reachable via `curl` or Postman (Principle IV).
  - All user input validated at the route-handler boundary (Principle II).
  - Shared types in `types/` with JSDoc on every exported field and function (Principle II).
  - GitHub issue and `docs/tickets/<N>/` are in sync (Principle V).
  - Commits on the branch follow Conventional Commits format (Principle VI).
- A reviewer (human or agent) MUST verify the diff against these criteria before approving. Self-merge without running the review checklist is prohibited.

**Rationale**: PRs are the enforcement layer for all other principles. Without a hard review gate, principles degrade into suggestions.

## Tech Stack Reference

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) |
| ORM | Drizzle (preferred) / Prisma |
| Database | PostgreSQL |
| Language | TypeScript (strict) |
| Package manager | pnpm |
| Shared types | `types/` folder |
| Shared UI logic | `lib/` or `helpers/` |
| API surface | `app/api/` route handlers |

## Governance

### How principles gate each workflow step

| Step | Gate |
|---|---|
| **Specify** | Confirm no existing feature covers the request (V). Draft GitHub issue with required ticket format (V). |
| **Plan** | Constitution Check in `plan.md` MUST pass before Phase 0 research proceeds. Verify tech stack (I), component structure (II), test strategy (III), REST surface (IV). |
| **Tasks** | Every task referencing a DB operation MUST pair with a real-integration-test task (III). Tasks touching UI MUST produce composable components (II). |
| **Implement** | Route handlers validate input at the boundary (II). Types go in `types/` (II). No direct DB calls outside `app/api/` (IV). pnpm only (I). |
| **Commit** | Conventional Commits format (`type(scope): subject`, ≤50 chars). Stage named files only — no `git add -A`. One logical change per commit; one commit per Spec Kit phase. No AI co-author trailers. Feature branch only — never commit to `main` (VI). |
| **Review / Merge** | PR MUST pass all review-gate criteria (VII): real DB tests, no mocks, composable components, no duplication, curl-reachable API, boundary validation, typed with JSDoc, issue + docs/ in sync, Conventional Commits on branch. Self-merge prohibited. |
| **Merge & Cleanup** | Squash-merge to `main`; close the linked issue explicitly after squash (`gh issue close N`). Delete the feature branch on merge. Prefer independent PRs off `main`; merge any unavoidable stack bottom-up in dependency order — never retarget dependents out of order (VI). |

### Amendment procedure

1. Open a GitHub issue describing the proposed amendment with rationale.
2. Update this file and increment the version (MAJOR / MINOR / PATCH per semver semantics above).
3. Update `LAST_AMENDED_DATE`.
4. Update any templates whose Constitution Check sections reference the changed principle.
5. Commit with message: `docs: amend constitution to vX.Y.Z — <one-line summary>`.

### Versioning policy

- **MAJOR**: backward-incompatible removal or redefinition of a principle.
- **MINOR**: new principle or section added, or materially expanded guidance.
- **PATCH**: clarifications, wording, typo fixes, non-semantic refinements.

### Compliance

All PRs and spec reviews MUST verify compliance with all five core principles. A violation blocks merge until resolved or an explicit exception is documented in the Complexity Tracking table of the relevant `plan.md`.

**Version**: 1.2.0 | **Ratified**: 2026-06-21 | **Last Amended**: 2026-06-22
