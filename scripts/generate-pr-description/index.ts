import { execSync } from "node:child_process";
import {
  parseCC,
  formatDescription,
  isBreaking,
  generateOverview,
} from "./generate-pr-description.utils.js";
import type { Commit } from "./generate-pr-description.utils.js";

const [baseSha, headSha, repo] = process.argv.slice(2);
if (!baseSha || !headSha || !repo) {
  console.error("Usage: index.ts BASE_SHA HEAD_SHA OWNER/REPO");
  process.exit(1);
}

const repoUrl = `https://github.com/${repo}`;

function run(cmd: string): string {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

const hashes = run(`git log --reverse --format="%H" "${baseSha}..${headSha}"`)
  .split("\n")
  .filter(Boolean);

const commits: Commit[] = hashes.map((hash) => {
  const shortHash = run(`git rev-parse --short ${hash}`);
  const subject = run(`git log -1 --format="%s" ${hash}`);
  const body = run(`git log -1 --format="%b" ${hash}`);
  const parsed = parseCC(subject);

  return {
    hash: shortHash,
    type: parsed.type,
    scope: parsed.scope,
    breaking: isBreaking(parsed.breakingBang, body),
    description: formatDescription(parsed.rawDesc),
    body,
    commitUrl: `${repoUrl}/commit/${hash}`,
  };
});

process.stdout.write(generateOverview(commits));
