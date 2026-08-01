import { readFileSync, existsSync, readdirSync, lstatSync } from 'fs'
import { join } from 'path'
import { extractSkills, findMissingSkills, findSymlinkIssues } from './validate-skills.utils.js'

const claudeMd = readFileSync('CLAUDE.md', 'utf-8')
const skills = extractSkills(claudeMd)
const missing = findMissingSkills(skills, existsSync)

const agentSkills = readdirSync('.agents/skills')
const claudeSkills = readdirSync('.claude/skills')
const symlinkIssues = findSymlinkIssues(
  agentSkills,
  claudeSkills,
  skill => lstatSync(join('.claude', 'skills', skill)).isSymbolicLink(),
)

for (const { skill, path } of missing) {
  console.error(`Missing: ${skill} → ${path}`)
}
for (const issue of symlinkIssues) {
  if (issue.kind === 'not-symlink') {
    console.error(`Not a symlink: .claude/skills/${issue.skill}`)
  } else {
    console.error(`Missing symlink: .claude/skills/${issue.skill} → .agents/skills/${issue.skill}`)
  }
}

const total = missing.length + symlinkIssues.length
if (total > 0) {
  console.error(`\n${total} issue(s) found.`)
  process.exit(1)
} else {
  console.log(`All ${skills.length} skills present. Symlinks in sync.`)
}
