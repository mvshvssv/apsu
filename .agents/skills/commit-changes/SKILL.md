---
name: commit-changes
description: >
  Create a git commit in the current working tree. Reads commitlint rules,
  drafts a terse Conventional Commits message, validates it, then commits.
  Use when the user says "commit", "commit this", "commit my changes", "make
  a commit", "create a commit", or "/commit-changes". Do not trigger for
  read-only queries about commit history.
---

## Steps

### 1. Resolve staged files

Run `git status --porcelain` and count lines beginning with a staged status code (`[MADRC]` in column 1).

**If nothing is staged:** run `git add .`. The system command-run confirmation covers this — no skill-level prompt needed.

**If files are already staged:** proceed — use only those files. Do not run `git add`.

Completion criterion: staged set is non-empty.

### 2. Extract issue number from branch

Run:
```bash
git symbolic-ref --short HEAD
```

If the branch name matches `^(\d+)-`, capture the number as `ISSUE`. Otherwise `ISSUE` is unset.

Completion criterion: `ISSUE` noted (may be empty).

### 3. Read commitlint rules

Read `commitlint.config.js` from the project root. It defines custom rules beyond Conventional Commits defaults — read the rule implementations directly to learn their intent; don't rely on a fixed list here, since the file is the source of truth and can change independently of this skill.

Completion criterion: custom rules understood; if the file is absent, skip this step and skip lint validation in step 5.

### 4. Generate commit message

Draft a Conventional Commits message from the staged diff (`git diff --cached`), satisfying the rules from step 3. No `Co-Authored-By` trailer.

Keep it caveman-terse:
- Subject: imperative mood ("add", "fix", not "added", "adds"), ≤50 chars when possible, hard cap 72, no trailing period.
- Body: only if the subject isn't self-explanatory; wrap at 72 chars.
- Never write "this commit does X", "I", "we", "now", "currently", any AI-attribution line, emoji, or the scope's own name restated in the subject.

If `ISSUE` is set and the generated message has no `Closes #N` / `Fixes #N` / `Resolves #N` footer line, append `Closes #<ISSUE>` as the last footer line (separated from the rest by a blank line if no footer exists yet). Footer lines must not end with a period.

### 5. Validate with commitlint

Write the draft message to `/tmp/.commit-msg-draft` and run:

```bash
npx --no -- commitlint --edit /tmp/.commit-msg-draft
```

- **Pass:** proceed to step 6.
- **Fail:** regenerate (step 4) and re-validate. Max 3 total attempts.
  - After 3 failures: show the last draft in a code block, list all lint errors, and stop with: "Could not produce a valid message after 3 attempts. Edit the draft above." Then proceed to step 6 with the user's corrected text, re-validated.

Completion criterion: a lint-clean message exists, or the user has supplied a corrected draft.

### 6. Commit

Run:

```bash
git commit -m "$(cat <<'EOF'
<message>
EOF
)"
```

Report the commit hash and subject line from `git log -1 --oneline`.
