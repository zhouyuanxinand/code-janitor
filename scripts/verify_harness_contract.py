#!/usr/bin/env python3
"""Check the portable Agent Skills contract used by supported harnesses."""

from __future__ import annotations

import re
import sys
from pathlib import Path


EXPECTED_NAME = "code-janitor"
FRONTMATTER_FIELDS = {"name", "description"}
NAME_PATTERN = re.compile(r"^[a-z0-9-]+$")
MAX_DESCRIPTION_LENGTH = 1024


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_frontmatter(skill_path: Path) -> dict[str, str]:
    lines = skill_path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0] != "---":
        fail("SKILL.md must begin with YAML frontmatter.")

    try:
        end = lines.index("---", 1)
    except ValueError:
        fail("SKILL.md frontmatter is not closed.")

    fields: dict[str, str] = {}
    for line in lines[1:end]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            fail(f"Unsupported frontmatter syntax: {line!r}")
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip().strip('"')
    return fields


def verify_relative_links(root: Path, skill_path: Path) -> None:
    content = skill_path.read_text(encoding="utf-8")
    for destination in re.findall(r"\]\(([^)]+)\)", content):
        if "://" in destination or destination.startswith("#"):
            continue
        target = root / destination.split("#", 1)[0]
        if not target.exists():
            fail(f"SKILL.md links to missing local resource: {destination}")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    skill_path = root / "SKILL.md"
    if root.name != EXPECTED_NAME:
        fail(
            f"Skill directory must be named {EXPECTED_NAME!r}; found {root.name!r}."
        )
    if not skill_path.is_file():
        fail("Missing SKILL.md.")

    fields = parse_frontmatter(skill_path)
    if set(fields) != FRONTMATTER_FIELDS:
        fail(
            "Portable SKILL.md frontmatter must contain only name and description; "
            f"found {sorted(fields)}."
        )
    if fields["name"] != EXPECTED_NAME:
        fail(
            f"Frontmatter name must be {EXPECTED_NAME!r}; found {fields['name']!r}."
        )
    if not NAME_PATTERN.fullmatch(fields["name"]):
        fail("Frontmatter name must use lowercase letters, digits, and hyphens only.")
    if not fields["description"]:
        fail("Frontmatter description must not be empty.")
    if len(fields["description"]) > MAX_DESCRIPTION_LENGTH:
        fail(
            "Frontmatter description must be at most "
            f"{MAX_DESCRIPTION_LENGTH} characters."
        )

    verify_relative_links(root, skill_path)
    if not (root / "agents" / "openai.yaml").is_file():
        fail("Missing optional Codex metadata at agents/openai.yaml.")

    print("Portable harness contract: valid")


if __name__ == "__main__":
    main()
