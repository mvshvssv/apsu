---
name: codifying-standards
description: Use when the user says "make that a rule", "we should always do X", "that's the third time we've fixed this", or when `code-review` surfaces the same Standards finding across hunks. Reserved for a convention that has repeated — not the read-the-doc-before-coding habit, and not domain concepts, which route to `domain-modeling`.
---

# Codifying Standards

A convention has crystallised. Codify it: one rule, exactly one home.

## Offer sparingly

Only when all three hold:

1. **It has repeated.** One occurrence is a preference, not a standard.
2. **It generalises.** A fix specific to one function is a fix.
3. **Tooling isn't already catching it.** If lint would have flagged it, that was a lint failure, not a missing rule.

## The gate

Three tests in order — stop at the first that answers:

1. **Is it about what the project _does_ — a concept, a term, a decision?** → `CONTEXT.md` or an ADR, via `domain-modeling`. Hand off and stop; this skill's work ends there.
2. **Can eslint encode it?** → `eslint.config.js`. A rule tooling enforces needs no prose.
3. **Is it already taught elsewhere?** → The entry cites that source rather than restating it.

Anything still standing is a style rule, and its home is `docs/agents/code-style.md`. Headings there are open, not a fixed list — each names a pattern this project's stack actually has. One sentence — a why-clause or example earns its place only where the rule is ambiguous without one. File it under the heading that already covers the same subject; where none does, add one named for what the rule constrains — never for a pattern the project doesn't have yet.

## Procedure

1. **Propose before writing.** Name the rule and the home the gate gave it, in one sentence, at the next natural pause — never mid-edit, since the trigger usually fires inside another task.

2. **Codify on approval.** Encoding in eslint has a cap, so a style rule stays a style rule instead of turning into a repo-wide refactor: enable the rule and run `pnpm lint`; if violations are widespread, land as a doc entry instead and say the _home_ changed, not the rule.

3. **Verify and stop.** `pnpm lint` and `pnpm format:check` green. Leave the change uncommitted — `commit-changes` stays the single owner of commits, and an eslint change is reviewable in the diff before it's permanent. Done when the rule exists in exactly one home, both checks pass, and nothing is committed.
