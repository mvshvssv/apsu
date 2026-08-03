# Apsu

A Node/TypeScript project skeleton wired for working with Claude Code: a set of engineering skills, GitHub conventions, and CI that checks all three.

## Setup

```bash
pnpm install   # Node ≥ 22.16 (or ≥ 24), pnpm
```

## AI workflows

Skills live in `.agents/skills/`, symlinked from `.claude/skills/`. Claude fires most of them from what you say; the `/name` ones you type yourself.

### Planning & Design

| Skill                           | Trigger                                                           |
| ------------------------------- | ----------------------------------------------------------------- |
| `grilling`                      | "stress-test this", "poke holes in this plan"                     |
| `domain-modeling`               | "what should we call this", "write an ADR"                        |
| `codebase-design`               | "what's the right interface here"                                 |
| `improve-codebase-architecture` | `/improve-codebase-architecture` — scan for refactors worth doing |
| `to-spec`                       | `/to-spec` — this conversation into a spec issue                  |
| `to-tickets`                    | `/to-tickets` — a plan into dependency-ordered tickets            |
| `triage`                        | `/triage` — walk the issue backlog                                |

### Building

| Skill                       | Trigger                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `tdd`                       | "test-first", "write the test first"                             |
| `prototype`                 | "spike it", "does this state model feel right"                   |
| `diagnosing-bugs`           | "debug this", or report something broken                         |
| `resolving-merge-conflicts` | "finish the rebase"                                              |
| `implement`                 | `/implement <n>` — build a GitHub issue, stops before committing |

### Review & Ship

| Skill            | Trigger                        |
| ---------------- | ------------------------------ |
| `code-review`    | "review my changes since main" |
| `commit-changes` | "commit this"                  |
| `open-pr`        | "open a PR"                    |

### Research & Continuity

| Skill      | Trigger                                             |
| ---------- | --------------------------------------------------- |
| `research` | "look up how X works"                               |
| `handoff`  | `/handoff` — compact the session for the next agent |

### Authoring Skills

| Skill                  | Trigger                                             |
| ---------------------- | --------------------------------------------------- |
| `writing-great-skills` | `/writing-great-skills` — adding or editing a skill |

## Skill sources

Most skills come from [`mattpocock/skills`](https://github.com/mattpocock/skills). [`skills-lock.json`](skills-lock.json) records the upstream path per skill.

Changes made here:

| Change                                                                                                        | Why                                                               |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `/ponytail` hook added to `tdd`, `implement`, `prototype`, `diagnosing-bugs`, `improve-codebase-architecture` | Pause before writing code, take the simplest version that works   |
| `code-review` gained a third axis, Overengineering, run via `/ponytail-review`                                | Upstream reviews Standards + Spec only                            |
| `/setup-matt-pocock-skills` references replaced with `docs/agents/*` pointers                                 | Tracker and label config is checked into this repo, not generated |
| `to-tickets` maps tickets onto the repo's issue templates                                                     | Files bugs and features with the right form and label             |
| `implement` rewritten around GitHub issues                                                                    | Reads the issue, branches, builds, stops before committing        |
| `commit-changes`, `open-pr`                                                                                   | Local, no upstream equivalent                                     |

`/ponytail` and `/caveman-commit` come from the plugins listed in `.claude/settings.json` — install those or edit the references out.

## Code Validation

`eslint` for lint, `prettier` for format, `vitest` for tests, `tsc --noEmit` for types (strict + `noUncheckedIndexedAccess`, bundler resolution), `tsx` to run scripts.

```bash
pnpm lint             # eslint . --max-warnings 0
pnpm lint:fix
pnpm format           # ts, js, json, yml, md
pnpm format:check
pnpm typecheck
pnpm test
pnpm validate-skills   # every skill in the CLAUDE.md table exists and is symlinked
```

Lint and format config is preset-driven — see `eslint.config.js`, `.prettierrc.json` and `.prettierignore`. The conventions those presets can't enforce — file layout, comments, escape hatches — live in [`docs/agents/code-style.md`](docs/agents/code-style.md).

Commits go through `husky` + `commitlint` (Conventional Commits, plus local rules: issue refs in the footer only, body paragraphs capitalized and terminated). `.husky/pre-commit` runs `pnpm lint && pnpm format:check`.

Two workflows in `.github/workflows/`:

- **`ci.yml`** — lints commit messages since `origin/main`, then lint, format:check, typecheck, test, validate-skills.
- **`pr-description.yml`** — fills a new PR's empty `## Overview` from the branch's commits, grouped by Conventional Commit type. `/open-pr` runs the same script locally, so the job exits early when you use it.

Issue and PR templates live in `.github/`.

## Extending

Fork-friendly by design. Nothing here assumes a domain.

- **Project docs** — `CLAUDE.md` holds the skill table and house style; `CONTEXT.md` (glossary) and `docs/adr/` get created on demand by `/domain-modeling`.
- **Agent config** — `docs/agents/` names the issue tracker, triage labels, and where domain docs live. Point these at your own setup.
- **Code style** — `docs/agents/code-style.md` seeds a few rules from this skeleton's own conventions. Replace them with yours; the "Adding a rule" gate keeps new ones from sprawling.
- **New skills** — add under `.agents/skills/`, symlink into `.claude/skills/`, add a table row in `CLAUDE.md` if Claude should invoke it. `pnpm validate-skills` enforces the wiring.
- **Upstream updates** — diff a skill against its `skills-lock.json` path, reapply the local changes above.
