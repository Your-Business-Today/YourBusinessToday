"""Reads the tables the schema declares and the longest text each column accepts, from SQL and EF Core migrations."""
from __future__ import annotations

from pathlib import Path

from ..source_files import matchesAny
from .ef_schema import efTables
from .sql_schema import sqlTables

EXCLUDED_WHEN_UNSET = ["**/node_modules/**", "**/bin/**", "**/obj/**", "**/.svelte-kit/**"]


def tablesIn(text: str) -> dict[str, dict]:
    tables = efTables(text)
    for table, columns in sqlTables(text).items():
        tables.setdefault(table, {}).update(columns)
    return tables


def readSchema(repositoryRoot: Path, inputRules: dict) -> dict[str, dict]:
    excluded = inputRules.get("schemaExcludeGlobs", EXCLUDED_WHEN_UNSET)
    tables: dict[str, dict] = {}
    for pattern in inputRules.get("schemaGlobs", []):
        for path in sorted(repositoryRoot.glob(pattern)):
            relative = path.relative_to(repositoryRoot).as_posix()
            if not path.is_file() or matchesAny(relative, excluded):
                continue
            for table, columns in tablesIn(path.read_text(encoding="utf-8", errors="replace")).items():
                tables.setdefault(table, {}).update(columns)
    return tables
