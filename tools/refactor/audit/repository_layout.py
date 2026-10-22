"""Where the kit's files sit in a repository: the refactor folder, its rules and kit version, and the audit's output."""
from __future__ import annotations

from pathlib import Path

REFACTOR_DIRECTORY = Path("tools") / "refactor"
RULES_FILE = REFACTOR_DIRECTORY / "rules.json"
KIT_VERSION_FILE = REFACTOR_DIRECTORY / "kit-version"
PLAN_DOCUMENT = REFACTOR_DIRECTORY / "refactor-plan.md"
AUDIT_OUTPUT_DIRECTORY = REFACTOR_DIRECTORY / "audit-output"
AUDIT_FILE = AUDIT_OUTPUT_DIRECTORY / "audit.json"
PLAN_FILE = AUDIT_OUTPUT_DIRECTORY / "refactor-plan.json"
