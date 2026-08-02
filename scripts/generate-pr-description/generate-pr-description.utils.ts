export interface ParsedCC {
  type: string;
  scope: string;
  breakingBang: boolean;
  rawDesc: string;
}

export interface Commit {
  hash: string;
  type: string;
  scope: string;
  breaking: boolean;
  description: string;
  body: string;
  commitUrl: string;
}

const CC_PATTERN = /^([a-zA-Z]+)(?:\(([^)]+)\))?(!)?: (.+)/;

export function parseCC(subject: string): ParsedCC {
  const match = CC_PATTERN.exec(subject);
  if (!match) {
    return { type: '', scope: '', breakingBang: false, rawDesc: subject };
  }
  return {
    type: match[1] ?? '',
    scope: match[2] ?? '',
    breakingBang: match[3] === '!',
    rawDesc: match[4] ?? subject,
  };
}

export function formatDescription(raw: string): string {
  if (!raw) return raw;
  const capitalized = raw.charAt(0).toUpperCase() + raw.slice(1);
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
}

export function isBreaking(bang: boolean, body: string): boolean {
  return bang || /^BREAKING CHANGE:/m.test(body);
}

const TYPE_SECTION: Record<string, string> = {
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance',
  refactor: 'Refactoring',
  docs: 'Documentation',
  test: 'Tests',
  build: 'Build',
  ci: 'CI',
};

const SECTION_ORDER = [
  'Breaking Changes',
  'Features',
  'Bug Fixes',
  'Performance',
  'Refactoring',
  'Documentation',
  'Tests',
  'Build',
  'CI',
  'Other Changes',
] as const;

export function getSection(type: string): string {
  return TYPE_SECTION[type] ?? 'Other Changes';
}

export function formatEntry(commit: Commit, bullet = false): string {
  const link = `([${commit.hash}](${commit.commitUrl}))`;
  const bulletStr = bullet ? '* ' : '';
  const indent = bullet ? '  ' : '';
  const headline = commit.scope
    ? `${bulletStr}**${commit.scope}:** ${commit.description} ${link}`
    : `${bulletStr}${commit.description} ${link}`;

  if (!commit.body) return headline;

  const trimmed = commit.body.replace(/\n+$/, '');
  const indented = trimmed
    .split('\n')
    .map(line => (line === '' ? '' : indent + line))
    .join('\n');

  return `${headline}\n\n${indented}`;
}

export function groupBySection(commits: Commit[]): Map<string, Commit[]> {
  const sections = new Map<string, Commit[]>();

  const add = (section: string, commit: Commit) => {
    const entries = sections.get(section) ?? [];
    entries.push(commit);
    sections.set(section, entries);
  };

  for (const commit of commits) {
    const section = getSection(commit.type);
    add(section, commit);
    if (commit.breaking && section !== 'Breaking Changes') {
      add('Breaking Changes', commit);
    }
  }

  const ordered = new Map<string, Commit[]>();
  for (const section of SECTION_ORDER) {
    const sectionCommits = sections.get(section);
    if (sectionCommits) ordered.set(section, sectionCommits);
  }
  return ordered;
}

export function generateOverview(commits: Commit[]): string {
  const [first] = commits;
  if (!first) return '';
  if (commits.length === 1) return formatEntry(first);

  const sections = groupBySection(commits);
  const parts: string[] = [];

  for (const [section, sectionCommits] of sections) {
    const entries = sectionCommits.map(c => formatEntry(c, true)).join('\n\n');
    parts.push(`### ${section}\n\n${entries}`);
  }

  return parts.join('\n\n');
}
