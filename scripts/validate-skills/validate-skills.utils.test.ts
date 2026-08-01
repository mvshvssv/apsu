import { describe, it, expect } from "vitest";
import { extractSkills, findMissingSkills, findSymlinkIssues } from "./validate-skills.utils.js";

// ── extractSkills ─────────────────────────────────────────────────────────────

describe("extractSkills", () => {
  it("extracts skill names from table rows", () => {
    const md =
      '| `add-ingredient` | "add ingredient" |\n| `add-recipe` | "add recipe" |';
    expect(extractSkills(md)).toEqual(["add-ingredient", "add-recipe"]);
  });

  it("returns empty array when no skill rows present", () => {
    expect(extractSkills("# Heading\nsome text\n| Header | Value |")).toEqual(
      [],
    );
  });

  it("ignores table rows without backtick-wrapped names", () => {
    const md =
      '| add-ingredient | "add ingredient" |\n| `add-recipe` | "add recipe" |';
    expect(extractSkills(md)).toEqual(["add-recipe"]);
  });

  it("ignores skill names containing uppercase letters", () => {
    const md = "| `ValidSkill` | desc |\n| `valid-skill` | desc |";
    expect(extractSkills(md)).toEqual(["valid-skill"]);
  });
});

// ── findMissingSkills ─────────────────────────────────────────────────────────

describe("findMissingSkills", () => {
  it("returns empty array when all skills exist", () => {
    expect(findMissingSkills(["add-ingredient"], () => true)).toEqual([]);
  });

  it("returns missing skill with correct path", () => {
    const result = findMissingSkills(["add-ingredient"], () => false);
    expect(result).toEqual([
      {
        skill: "add-ingredient",
        path: ".claude/skills/add-ingredient/SKILL.md",
      },
    ]);
  });

  it("returns only missing skills when some exist", () => {
    const present = new Set([".claude/skills/add-recipe/SKILL.md"]);
    const result = findMissingSkills(["add-ingredient", "add-recipe"], (path) =>
      present.has(path),
    );
    expect(result).toEqual([
      {
        skill: "add-ingredient",
        path: ".claude/skills/add-ingredient/SKILL.md",
      },
    ]);
  });

  it("returns empty array for empty skills list", () => {
    expect(findMissingSkills([], () => false)).toEqual([]);
  });

  it("returns all skills when none exist", () => {
    const result = findMissingSkills(["a", "b"], () => false);
    expect(result.map((r) => r.skill)).toEqual(["a", "b"]);
  });
});

// ── findSymlinkIssues ─────────────────────────────────────────────────────────

describe("findSymlinkIssues", () => {
  it("returns empty when all agent skills are symlinked in claude", () => {
    expect(findSymlinkIssues(["tdd"], ["tdd"], () => true)).toEqual([]);
  });

  it("returns not-symlink when claude entry is a real directory", () => {
    expect(findSymlinkIssues(["tdd"], ["tdd"], () => false)).toEqual([
      { kind: "not-symlink", skill: "tdd" },
    ]);
  });

  it("returns missing-symlink when agent skill has no claude entry", () => {
    expect(findSymlinkIssues(["tdd"], [], () => true)).toEqual([
      { kind: "missing-symlink", skill: "tdd" },
    ]);
  });

  it("returns not-symlink for claude real dir even when not in agent skills", () => {
    expect(findSymlinkIssues([], ["add-ingredient"], () => false)).toEqual([
      { kind: "not-symlink", skill: "add-ingredient" },
    ]);
  });

  it("returns both issue kinds when mixed problems exist", () => {
    const symlinked = new Set(["tdd"]);
    const result = findSymlinkIssues(
      ["tdd", "grilling"],
      ["tdd", "add-ingredient"],
      (skill) => symlinked.has(skill),
    );
    expect(result).toEqual([
      { kind: "not-symlink", skill: "add-ingredient" },
      { kind: "missing-symlink", skill: "grilling" },
    ]);
  });

  it("returns empty for empty inputs", () => {
    expect(findSymlinkIssues([], [], () => false)).toEqual([]);
  });
});
