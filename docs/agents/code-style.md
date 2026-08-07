# Code Style

This repo local style rule: mechanical convention tooling cannot enforce.

## Tooling owns style

`eslint.config.js`, `.prettierrc.json`, `tsconfig.json` = style definition here. No hand-police what they enforce. No restate rule in prose — read config.

Before call work done:

```bash
pnpm lint:fix
pnpm format
pnpm typecheck
pnpm test
```

`.husky/pre-commit` run `pnpm lint && pnpm format:check`, reject commit if either fail. Skip these only move failure later.

Fix code, not linter: silence rule to make `pnpm lint` green not fix. See **Escape hatches** for narrow legit disable.

## Prototypes

Tooling still apply to spike. Judgment rule — no.

## Comments

Explain why, not what. Keep density low — comment earn place by carry context code cannot.

```ts
// Good — Tolerates the cell padding Prettier adds when it aligns Markdown tables.
// Bad  — Matches a skill row.
const SKILL_ROW = /\|[ \t]*`([a-z-]+)`[ \t]*\|/g;
```

## Escape hatches

No `eslint-disable` or `@ts-expect-error` without comment justify. Codebase now hold zero of either.

## Scripts

One directory per script, named for script. `index.ts` = I/O composition root. Pure logic in `<name>.utils.ts`. Test colocated `<name>.utils.test.ts` — cover `.utils`, not `index.ts`.

```
scripts/
└── validate-skills/
    ├── index.ts                      # reads files, prints, throws
    ├── validate-skills.utils.ts      # pure functions
    └── validate-skills.utils.test.ts
```
