import { access, lstat, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  extractSkills,
  findMissingSkills,
  findSymlinkIssues,
} from './validate-skills.utils';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const claudeMd = await readFile('CLAUDE.md', 'utf-8');
const skills = extractSkills(claudeMd);

// The utils take synchronous predicates so they stay pure and trivially
// testable; resolve the filesystem answers up front and hand them a lookup.
const presentPaths = new Set(
  (
    await Promise.all(
      skills.map(async skill => {
        const path = `.claude/skills/${skill}/SKILL.md`;
        return (await exists(path)) ? path : undefined;
      }),
    )
  ).filter(path => path !== undefined),
);
const missing = findMissingSkills(skills, path => presentPaths.has(path));

const [agentSkills, claudeSkills] = await Promise.all([
  readdir('.agents/skills'),
  readdir('.claude/skills'),
]);

const symlinked = new Map(
  await Promise.all(
    claudeSkills.map(async skill => {
      const stats = await lstat(join('.claude', 'skills', skill));
      return [skill, stats.isSymbolicLink()] as const;
    }),
  ),
);
const symlinkIssues = findSymlinkIssues(
  agentSkills,
  claudeSkills,
  skill => symlinked.get(skill) ?? false,
);

for (const { skill, path } of missing) {
  console.error(`Missing: ${skill} → ${path}`);
}
for (const issue of symlinkIssues) {
  if (issue.kind === 'not-symlink') {
    console.error(`Not a symlink: .claude/skills/${issue.skill}`);
  } else {
    console.error(
      `Missing symlink: .claude/skills/${issue.skill} → .agents/skills/${issue.skill}`,
    );
  }
}

const total = missing.length + symlinkIssues.length;
if (total > 0) {
  throw new Error(`${total.toFixed()} issue(s) found.`);
}
console.log(`All ${skills.length.toFixed()} skills present. Symlinks in sync.`);
