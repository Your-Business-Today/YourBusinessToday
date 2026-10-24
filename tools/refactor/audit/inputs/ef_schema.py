"""Reads the tables EF Core migrations declare and change: CreateTable, AddColumn and AlterColumn.

An AlterColumn carries the column's old type and length after its new ones (`oldType`, `oldMaxLength`), so only the
values before the first old one are read.
"""
from __future__ import annotations

import re

from .column_limits import columnKey, tableKey, textLimit

EF_TABLE = re.compile(r"CreateTable\(\s*name:\s*\"(?P<name>\w+)\"")
EF_COLUMN = re.compile(r"^\s*(?P<column>\w+)\s*=\s*table\.Column<", re.M)
EF_COLUMN_CHANGE = re.compile(r"(?:Add|Alter)Column<[^>]+>\(\s*name:\s*\"(?P<column>\w+)\",\s*table:\s*\"(?P<name>\w+)\"(?P<rest>.*?)\);", re.S)
OLD_VALUES = re.compile(r",\s*old\w+:")


def newValuesOf(rest: str) -> str:
    return OLD_VALUES.split(rest, 1)[0]


def createdTables(text: str) -> dict[str, dict]:
    tables = {}
    starts = list(EF_TABLE.finditer(text))
    for index, start in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        section = text[start.end():end]
        lines = {found.group("column"): section[found.start():].split("\n", 1)[0] for found in EF_COLUMN.finditer(section)}
        tables[tableKey(start.group("name"))] = {columnKey(column): textLimit(line) for column, line in lines.items()}
    return tables


def efTables(text: str) -> dict[str, dict]:
    tables = createdTables(text)
    for found in EF_COLUMN_CHANGE.finditer(text):
        table = tables.setdefault(tableKey(found.group("name")), {})
        table[columnKey(found.group("column"))] = textLimit(newValuesOf(found.group("rest")))
    return tables
