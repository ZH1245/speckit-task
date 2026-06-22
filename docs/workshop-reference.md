# Spec Kit Workshop — Reference

End-to-end record of how this task app was built with [Spec Kit](https://github.com/github/spec-kit) and Claude Code. Every command and prompt used, in order, so the flow is reproducible live.

## Environment

| Tool | Version / detail |
|------|------------------|
| `specify` (Spec Kit CLI) | 0.9.5 |
| Agent integration | Claude Code |
| Package manager | pnpm |
| Stack | Next.js (App Router, API route handlers) + Drizzle + PostgreSQL |
| GitHub auth | `gh` CLI, account `ZH1245`, repo `ZH1245/speckit-task` |

> Command names in this CLI version use **hyphens**, not dots: `/speckit-constitution`, not `/speckit.constitution`.

## The flow at a glance

```
init  →  constitution  →  specify  →  clarify  →  plan  →  tasks  →  taskstoissues  →  implement
```

| Step | Command | Output |
|------|---------|--------|
| 1 | `specify init` (shell) | `.specify/` scaffold + skills |
| 2 | `/speckit-constitution` | `constitution.md` — durable principles (re-run to amend; v1.0.0 → v1.1.0) |
| 3 | `/speckit-specify` | `spec.md` — the what/why of the feature |
| 4 | `/speckit-clarify` (optional) | de-risks ambiguous spec areas |
| 5 | `/speckit-plan` | implementation plan + design artifacts |
| 6 | `/speckit-tasks` | `tasks.md` — dependency-ordered tasks |
| 7 | `/speckit-taskstoissues` | real GitHub issues via `gh` |
| 8 | `/speckit-implement` | scaffolds + builds the Next.js app |

Key idea: **constitution = reusable rulebook, specify = this feature.** Don't put tech stack or app features in the same place. Constitution holds rules every future feature obeys; specify describes one feature's what/why.

---

## Run log — what was actually executed

| # | Action | Result | Status |
|---|--------|--------|--------|
| 1 | `specify init . --integration claude --force` | `.specify/` + 15 skills + `CLAUDE.md` | ✅ |
| 2 | `/speckit-constitution` (principles) | `constitution.md` **v1.0.0** — 5 principles | ✅ |
| 3 | `/speckit-constitution` (amend) | **v1.1.0** — Principle VI (Git, +commitlint/husky) & VII (Code Review) | ✅ |
| 4 | `/speckit-specify` | branch `001-task-crud`, `spec.md` + `checklists/requirements.md` | ✅ |
| 5 | `/speckit-plan` | `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md` | ✅ |
| 6 | `/speckit-tasks` | `tasks.md` (dependency-ordered, `[P]` parallel markers) | ✅ |
| 7 | `/speckit-taskstoissues` | GitHub issues on `ZH1245/speckit-task` | ✅ |
| 8 | `/speckit-implement` | Next.js app: `app/`, `components/`, `db/`, `lib/`, `types/`, `tests/`, husky + commitlint + vitest | ✅ |

**Config tweak applied:** all `speckit.git.commit` hooks in `.specify/extensions.yml` flipped from `optional: true` → `optional: false` so each phase auto-commits (before + after). `agent-context` hooks left optional.

> Lesson learned the hard way: this doc lived in `docs/` and was **never committed**. The `/speckit-implement` scaffold cleared untracked files and the doc was lost — rebuilt from session history. **Commit reference docs before running implement.**

---

## Step 1 — Initialize the project (shell)

```bash
specify init . --integration claude --force
```

`.` / `--here` scaffolds in the current directory; `--force` skips the non-empty confirmation when `.git` already exists. Produces `.specify/`, `CLAUDE.md`, and skills under `.claude/skills/`. No network needed.

### GitHub remote (needed before Step 7)

```bash
gh repo create speckit-task --private --source=. --push
```

---

## Database — local PostgreSQL (required for real tests)

The constitution mandates **real DB tests, no mocks** (Principle III). So a live Postgres must be running before `/speckit-implement` and before tests.

Quick throwaway (exactly as run in the workshop — ephemeral, dies on Ctrl-C, no port exposed):

```bash
docker run -e POSTGRES_PASSWORD=postgres postgres
```

Usable variant — maps the port, names the container, creates the db, runs detached:

```bash
docker run --name speckit-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=speckit \
  -p 5432:5432 \
  -d postgres
```

Connection string for `.env.local` / `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/speckit
```

Then apply the Drizzle schema:

```bash
pnpm drizzle-kit push      # or the migrate script defined in package.json
```

Stop / clean up the named container:

```bash
docker stop speckit-pg && docker rm speckit-pg
```

---

## Step 2 — Constitution prompt

Governing principles only — durable rules every feature must follow. No app-specific features here.

```
/speckit-constitution Create the governing principles for a small demo task-management web app. These are durable rules every feature must follow.

TECH STACK (fixed constraints):
- Next.js with API-route-based backend (app router, route handlers under app/api).
- ORM: Drizzle (preferred) or Prisma, with PostgreSQL.
- Package manager: pnpm ONLY. Add deps via `pnpm add <name>` with NO pinned version unless resolving a real conflict. Never hand-write package.json or dependency versions; scaffold via official generators (e.g. `pnpm create next-app`).
- TypeScript throughout. Scaffold into the CURRENT folder, never a subfolder.

CODE QUALITY PRINCIPLES:
- Single Responsibility Principle per module/file. One concern per file; split when a file does two things.
- Divide-and-conquer component design: small composable child components, no monolith pages.
- No duplication: shared UI logic lives in helper files (e.g. lib/ or helpers/), imported, never copy-pasted.
- All shared types live in a dedicated types/ folder. Use JSDoc on type fields so IDEs show intellisense and autocomplete. Add JSDoc to exported functions.
- Comments explain WHY (non-obvious intent), not WHAT well-named code already says.
- Validate all user input at the API boundary. This is a demo: skip auth.

TESTING PRINCIPLES:
- Real tests only — exercise actual DB inserts/reads/deletes against a real (or test) Postgres. No mocked/fake assertions that prove nothing.

API PRINCIPLES:
- Every resource action reachable via REST so it works from curl/Postman (e.g. POST /api/tasks creates a task). No UI-only coupling.

WORKFLOW & GOVERNANCE:
- BEFORE creating any spec, task, or implementation: search the repo for existing related code/features and build on it — never duplicate existing functionality.
- GitHub tickets are the source of truth. For every feature create a GitHub issue via `gh`.
- Ticket format — TITLE, then description in this exact order: Summary, Scope, Out of Scope, Acceptance Criteria.
- docs/ mirrors tickets: docs/tickets/<N>/ holds the ticket's current status and docs/tickets/<N>/implementation-plan.md holds the agreed plan. Keep docs and GitHub issues in sync.

Include short governance describing how these principles gate every specify/plan/tasks/implement step.
```

Writes `.specify/memory/constitution.md` (ratified **v1.0.0**).

### Step 2b — Amend constitution (v1.1.0): add Git & Review principles

Re-running `/speckit-constitution` with new principles merges into the existing file, bumps the version, and re-syncs templates.

```
/speckit-constitution Amend the constitution: ADD two new core principles (keep all five existing ones unchanged). This is a MINOR version bump to 1.1.0.

ADD Principle VI — Git & Version Control (NON-NEGOTIABLE):
- Conventional Commits format: `type(scope): subject`, subject <=50 chars, imperative mood. Types: feat, fix, docs, test, refactor, chore.
- Enforce the commit format with commitlint (@commitlint/config-conventional) wired through a husky `commit-msg` hook, so a non-conforming message is rejected locally before it lands. Install dev deps via `pnpm add -D commitlint @commitlint/config-conventional husky`.
- Allowed types: feat, fix, docs, test, refactor, chore, ci, build, perf, style.
- Enforced subject pattern: `^(feat|fix|docs|test|refactor|chore|ci|build|perf|style)(\(.+\))?: .{1,50}$`
- Commit message captures WHY, not WHAT — the diff already shows what changed. Body only when reasoning is non-obvious.
- One logical change per commit. No mixing unrelated changes. Each Spec Kit phase (constitution, specify, plan, tasks, implement) produces its own commit so history reads as a clean timeline.
- Never stage with `git add -A` / `git add .` — stage named files only, to avoid leaking secrets or build artifacts.
- Never add AI co-author trailers to commit messages.
- Branching: each feature is built on its own branch (e.g. `001-task-list`), never committed directly to main.
- Push policy: push feature branches to the GitHub remote. Open a Pull Request to merge into main — never push straight to main. Never force-push a shared branch.

ADD Principle VII — Code Review (NON-NEGOTIABLE):
- Every change reaches main through a Pull Request. No direct merges without review.
- The PR description links its GitHub issue and restates Acceptance Criteria as a checklist.
- Review gate — a change is approved only when ALL hold: real DB tests pass (Principle III), no mocked tests, no monolith components, no copy-pasted logic (Principle II), every API action reachable via curl (Principle IV), input validated at the boundary, types in types/ with JSDoc, GitHub issue and docs/tickets/<N>/ in sync (Principle V).
- A reviewer (human or agent) MUST verify the diff against these before approving. Self-merge without running the review checklist is prohibited.

Also update the Governance gate table: add a "Commit" gate (conventional format, named files, one phase per commit) and strengthen the "Review" row to reference Principle VII. Bump version to 1.1.0, MINOR.
```

> Workshop point: the constitution is **iterative**. Re-running the command amends rather than overwrites, and semver tracks the change (MINOR for new principles). You don't need it perfect on the first pass.

---

## Step 3 — Specify prompt

The actual feature — what/why, no tech detail (that lives in the constitution).

```
/speckit-specify A task app where users can: view a list of tasks, update task attributes inline, and delete a task with a UI confirmation dialog. Tasks are also creatable via REST (POST) for curl/Postman. Define what each screen shows and the task data fields — no tech-stack detail, that lives in the constitution.
```

Writes `specs/001-task-crud/spec.md`.

**What the spec produced:**
- Feature branch `001-task-crud`
- 4 user stories: View List (P1), Inline Edit (P2), Delete w/ Confirmation (P3), REST Create (P1)
- 12 functional requirements, all testable
- Task entity: `id, title, status (todo/in-progress/done), priority (low/medium/high), createdAt, updatedAt`
- 6 measurable, tech-agnostic success criteria
- Assumptions: newest-first ordering, no pagination, no auth, 255-char title max, modal confirm dialog

---

## Step 4 — Clarify (optional)

```
/speckit-clarify
```

Asks up to 5 targeted questions, encodes answers back into `spec.md`. Run before `plan`.

---

## Step 5 — Plan

```
/speckit-plan
```

Leave the input empty — plan auto-reads `spec.md` + `constitution.md`. Generates `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`.

---

## Step 6 — Tasks

```
/speckit-tasks
```

Produces `tasks.md` — dependency-ordered tasks with `[P]` markers on parallel-safe (disjoint-file) tasks. Those markers are what the implement step uses to fan out parallel agents.

---

## Step 7 — Tasks to GitHub issues

Needs the remote from Step 1. Creates one issue per task using `gh`, in the constitution's ticket format (Summary / Scope / Out of Scope / Acceptance Criteria).

```
/speckit-taskstoissues
```

> Demo caution: re-running after editing `tasks.md` can create **duplicate** issues. If duplicated, `gh repo delete speckit-task` and recreate clean before the live run.

---

## Step 8 — Implement (parallel multi-agent + PR-per-task)

The bare `/speckit-implement` runs tasks sequentially. To drive parallel sub-agents, per-task branches, and a PR per task, use the prompt below. It encodes the safe pattern: **foundation tasks run sequentially and merge first** (they share `package.json`/config), then feature `[P]` tasks fan out to parallel agents on disjoint files.

```
/speckit-implement Execute tasks.md using parallel multi-agent orchestration per the constitution.

EXECUTION MODEL:
- First, run all foundation/scaffold tasks SEQUENTIALLY on a single base branch and merge to main: project scaffold (pnpm create next-app into current folder), dependencies, Drizzle schema + migration, shared types/. These touch shared files (package.json, config) so they MUST NOT run in parallel.
- After foundation is merged, run feature tasks marked [P] in PARALLEL — one sub-agent per task, only on disjoint files. Respect dependency order: types → schema → app/api → UI. Never two agents on the same file. Migrations always sequential.

BRANCHING (one branch per task):
- Format: feature/task-<issue-number>-<short-slug> (e.g. feature/task-12-inline-edit). Use refactor/task-<n>-<slug> when the task is a refactor.
- Branch from latest main.

PULL REQUESTS (one PR per task branch):
- Open via gh. PR body links its GitHub issue (Closes #<n>) and restates the issue's Acceptance Criteria as a checkbox list, each box checked only when actually met.
- Real DB tests for that task must pass before opening the PR (constitution Principle III).

CONFLICTS:
- Before opening each PR, rebase the branch on latest main.
- If the rebase auto-resolves cleanly, proceed.
- If a conflict needs real judgment, STOP and report that branch — do NOT blind-resolve or force anything. List the conflicting files and wait.

Do not merge PRs without my approval. Report: per task — branch, PR url, test result, AC checklist state.
```

Why structured this way (workshop point):
- **Foundation-first, sequential** kills the conflict storm — if every agent forked from an empty `main` and all edited `package.json`/next config in parallel, every PR would conflict.
- **Branch names use the GitHub issue number**, so run `/speckit-taskstoissues` before this step.
- **Conflicts that need judgment STOP and report** instead of auto-resolving — blind conflict resolution corrupts code.

> Prereq order: `/speckit-tasks` → `/speckit-taskstoissues` → this implement prompt. And a live Postgres (see the Database section) must be running for the real tests to pass.

### Step 8 — actual results

- **Model / effort:** Claude Opus, medium effort.
- **Wall-clock:** ~43m 22s for the implement run + ~15m of follow-up wrangling (PR/issue cleanup, env fixes) ≈ **1 hour total**. Spec-kit gets you a full scaffold fast, but the last mile (merging the stack, DB env, local dev quirks) is hands-on.
- **Output:** 12 pull requests (#47–#58) and 30 GitHub issues (#17–#46) on `ZH1245/speckit-task`. Full Next.js app: `app/`, `components/`, `db/`, `lib/`, `types/`, `tests/`, husky + commitlint + vitest.

**PRs are a stacked chain, not 12 PRs into main.** Each task branch targets the branch below it; only the foundation PR targets `main`:

```
#47 feature/foundation-setup        → main
 #48 #49  → foundation
  #50 #51 → post-route / create-validator
   ... stacked up to #58            → #36 delete-dialog
```

**Why nothing was merged or auto-closed (by design):**
- The implement prompt ended with "Do not merge PRs without my approval" — the agent stopped at open PRs.
- Constitution Principle VII forbids self-merge; every change reaches main via reviewed PR.
- `Closes #n` only fires when a PR merges into the **default branch**. No merge → issues stay open. They double as the live task tracker.

**Manual follow-ups left for the human:**
1. **Merge PR #47 first** — every feature branch is based on it; nothing else can land until foundation hits main.
2. **Set `DATABASE_URL` in `.env.local`** — `db/index.ts` throws at startup without it, which blocks `pnpm build` and every integration test (real-DB-only per Principle III).

> Workshop takeaway: spec-kit builds and raises PRs but never merges — the merge/close gate is intentionally human. Stacked PRs are great for review but must be merged bottom-up (foundation → leaves).

### Gotcha — `pnpm dev` fails with a bootloader `MODULE_NOT_FOUND`

If `pnpm dev` (or any node command) dies with:

```
Error: Cannot find module '.../ms-vscode.js-debug/bootloader.js .../ms-vscode.js-debug/bootloader.js'
requireStack: [ 'internal/preload' ]
```

This is **not the app** — it's Cursor/VS Code's **Auto Attach** debugger injecting a malformed `NODE_OPTIONS=--require <bootloader>` into the integrated terminal. Fix:

```bash
unset NODE_OPTIONS && pnpm dev
```

Permanent: Cursor → `Cmd+Shift+P` → "Toggle Auto Attach" → Disabled, or run from a plain Terminal outside the editor.

---

## Auto-commit configuration

By default the git extension's commit hooks are `optional: true` — they only print a suggestion, they never run. To make every phase auto-commit, edit `.specify/extensions.yml` and set each `speckit.git.commit` hook to `optional: false` (leave `agent-context` optional). Only `optional: false` hooks emit `EXECUTE_COMMAND` and auto-run.

---

## Why the split matters (workshop talking point)

- **Constitution** is read by every later step. Keep it to durable rules (stack, code quality, testing, workflow, git, review). Feature noise here = every future feature re-reads it for nothing.
- **Specify** is per-feature. The task-CRUD UI lives here, not in the constitution.
- The constitution's "search existing code first" + GitHub-ticket + `docs/tickets/<N>/` rules are what keep multi-feature projects from drifting.
- **Commit your docs before implement** — untracked files can be cleared by the scaffold.
