"""Reads the tables SQL migrations declare and change: CREATE TABLE, ALTER TABLE ADD and ALTER TABLE ALTER COLUMN.

An ALTER COLUMN that names a type (`TYPE varchar(500)`, `SET DATA TYPE text`, or SQL Server's bare `nvarchar(500)`)
gives the column its new length; one that only sets or drops a default or a null constraint leaves the length alone.
"""
from __future__ import annotations

import re

from .column_limits import columnKey, tableKey, textLimit

TABLE_NAME = r"(?P<name>[\w.\"`\[\]]+)"
CREATE_TABLE = re.compile(rf"create\s+table\s+(?:if\s+not\s+exists\s+)?{TABLE_NAME}\s*\((?P<body>.*?)\)\s*;", re.I | re.S)
ALTER_ADD = re.compile(rf"alter\s+table\s+(?:only\s+)?{TABLE_NAME}\s+add\s+(?:column\s+)?(?:if\s+not\s+exists\s+)?(?P<body>[^;]+);", re.I)
ALTER_COLUMN = re.compile(rf"alter\s+table\s+(?:only\s+)?{TABLE_NAME}\s+(?:alter|modify)\s+(?:column\s+)?(?P<body>[^;]+);", re.I)
ALTERED_ITEM_PREFIX = re.compile(r"^\s*(?:alter|modify)\s+(?:column\s+)?", re.I)
TYPE_KEYWORD = r"(?:set\s+data\s+)?type\s+"
NAMES_A_TYPE = re.compile(rf"^\s*[\w\"`\[\]]+\s+(?:{TYPE_KEYWORD})?(?!set\b|drop\b)\w+", re.I)
CONSTRAINT_WORDS = {"constraint", "primary", "foreign", "unique", "check", "key", "index", "exclude"}
ITEM_SEPARATOR = ","
NAME_QUOTES = "\"`[]"


def topLevelItems(body: str) -> list[str]:
    items, depth, current = [], 0, ""
    for character in body:
        depth += {"(": 1, ")": -1}.get(character, 0)
        if character == ITEM_SEPARATOR and depth == 0:
            items.append(current)
            current = ""
            continue
        current += character
    return [*items, current]


def sqlColumns(body: str) -> dict[str, int | None]:
    columns = {}
    for item in topLevelItems(body):
        words = item.split()
        if not words or words[0].lower() in CONSTRAINT_WORDS:
            continue
        columns[columnKey(words[0].strip(NAME_QUOTES))] = textLimit(item)
    return columns


def alteredColumns(body: str) -> dict[str, int | None]:
    columns = {}
    for item in topLevelItems(body):
        definition = ALTERED_ITEM_PREFIX.sub("", item, count=1)
        if NAMES_A_TYPE.match(definition):
            columns.update(sqlColumns(definition))
    return columns


def sqlTables(text: str) -> dict[str, dict]:
    tables: dict[str, dict] = {}
    statements = [(CREATE_TABLE, sqlColumns), (ALTER_ADD, sqlColumns), (ALTER_COLUMN, alteredColumns)]
    for statement, columnsOf in statements:
        for found in statement.finditer(text):
            table = tableKey(found.group("name").strip(NAME_QUOTES))
            tables.setdefault(table, {}).update(columnsOf(found.group("body")))
    return tables
