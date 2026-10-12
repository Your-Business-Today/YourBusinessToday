"""Empties the text inside a line's string literals, so a check reads only the code around them.

Double-quoted, verbatim, single-quoted and template strings are all text: a MIME type, a file path or a
sentence written inside one is not a member chain. A template string keeps its ${...} parts, which are code.
"""
from __future__ import annotations

import re

STRING_LITERAL = re.compile(r'@"[^"]*"|"(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|`(?:[^`\\]|\\.)*`')
INTERPOLATION = re.compile(r"\$\{([^{}]*)\}")
TEMPLATE_QUOTE = "`"


def emptied(literal: re.Match) -> str:
    text = literal.group(0)
    quote = text[-1]
    if quote != TEMPLATE_QUOTE:
        return quote + quote
    interpolations = INTERPOLATION.findall(text)
    return TEMPLATE_QUOTE + " ".join(interpolations) + TEMPLATE_QUOTE


def withoutStringText(line: str) -> str:
    return STRING_LITERAL.sub(emptied, line)
