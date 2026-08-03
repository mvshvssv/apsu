# Code Style

This repo code-style rule: mechanical convention — how code shaped, formatted, laid out, commented — tooling cannot enforce.

Style rule only. Test on rule kind, not file kind: rule that constrain how code written — shape, name, layout, comment — go here. Rule that need know what project _does_ — what concept mean, what term use, what decision made — go `CONTEXT.md` or ADR via `domain-modeling` skill, never this doc.

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

Tooling still apply to spike. Judgment rule — Layout, Comments, Escape hatches — no.

## Layout

One directory per script, named for script. `index.ts` = I/O composition root. Pure logic in `<name>.utils.ts`. Test colocated `<name>.utils.test.ts` — cover `.utils`, not `index.ts`.

```
scripts/
└── validate-skills/
    ├── index.ts                      # reads files, prints, throws
    ├── validate-skills.utils.ts      # pure functions
    └── validate-skills.utils.test.ts
```

Seam between them = purity: utils take injected predicate, `index.ts` resolve filesystem answer up front, hand in. See `codebase-design` skill for why seam sit there.

## Comments

Explain why, not what. Keep density low — comment earn place by carry context code cannot.

```ts
// Good — Tolerates the cell padding Prettier adds when it aligns Markdown tables.
// Bad  — Matches a skill row.
const SKILL_ROW = /\|[ \t]*`([a-z-]+)`[ \t]*\|/g;
```

## Escape hatches

No `eslint-disable` or `@ts-expect-error` without comment justify. Codebase now hold zero of either.

## Adding a rule

Run four test in order. Stop at first that answer.

1. **Is it about what the project _does_?** → Domain. Use `domain-modeling`; no belong here.
2. **Can eslint encode it?** → Encode in `eslint.config.js` instead. Rule tooling enforce need no prose.
3. **Does a skill already teach it?** → Cite skill. No restate.
4. **Still needed?** → One sentence. Add why-clause or example only where rule ambiguous without.

Rule section use fixed vocabulary, so rule land predictable: **Layout**, **Naming**, **Comments**, **Types**, **Errors**, **Tests**, **Escape hatches**. Only ones with real rule exist as heading — no add empty one.
