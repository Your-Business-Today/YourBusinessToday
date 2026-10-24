"""The names and the longest text the schema gives a table and a column, in the words the audit matches on."""
from __future__ import annotations

import re

from ..words import wordsOf

TEXT_LIMIT = re.compile(r"(?:char(?:acter)?(?:\s+varying)?|varchar|nvarchar|nchar)\s*\(\s*(\d+)\s*\)|\bmaxLength:\s*(\d+)", re.I)


def tableKey(name: str) -> str:
    key = "".join(wordsOf(name.split(".")[-1]))
    if key.endswith("ies"):
        return key[:-3] + "y"
    return key[:-1] if key.endswith("s") else key


def columnKey(name: str) -> str:
    return "".join(wordsOf(name))


def textLimit(definition: str) -> int | None:
    found = TEXT_LIMIT.search(definition)
    return int(found.group(1) or found.group(2)) if found else None
