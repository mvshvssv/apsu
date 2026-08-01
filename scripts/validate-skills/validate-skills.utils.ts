const SKILL_ROW = /\| `([a-z-]+)` \|/g;

export function extractSkills(markdown: string): string[] {
  return [...markdown.matchAll(SKILL_ROW)].map((m) => m[1]);
}

type MissingSkill = { skill: string; path: string };

export type SymlinkIssue =
  | { kind: 'not-symlink'; skill: string }
  | { kind: 'missing-symlink'; skill: string }

export function findSymlinkIssues(
  agentSkills: string[],
  claudeSkills: string[],
  isSymlink: (skill: string) => boolean,
): SymlinkIssue[] {
  const claudeSet = new Set(claudeSkills)
  const issues: SymlinkIssue[] = []
  for (const skill of claudeSkills) {
    if (!isSymlink(skill)) issues.push({ kind: 'not-symlink', skill })
  }
  for (const skill of agentSkills) {
    if (!claudeSet.has(skill)) issues.push({ kind: 'missing-symlink', skill })
  }
  return issues
}

export function findMissingSkills(
  skills: string[],
  exists: (path: string) => boolean,
): MissingSkill[] {
  return skills
    .map((skill) => ({ skill, path: `.claude/skills/${skill}/SKILL.md` }))
    .filter(({ path }) => !exists(path));
}
