"""Empties the text of every triple-quoted block in a file — a docstring, a raw string — so a check reads only code.

A docstring is prose: python3 -m tools.refactor.audit.plan written in one names a module, it does not walk into
an object. A block opens and closes on any line, so the file is read whole and the code either side is kept.
"""
from __future__ import annotations

import re

TRIPLE_QUOTE = re.compile(r'"""|\'\'\'')


def withoutTextBlocks(lines: list[str]) -> list[str]:
    openQuote = None
    codeLines = []
    for line in lines:
        code, openQuote = codeOutsideBlocks(line, openQuote)
        codeLines.append(code)
    return codeLines


def codeOutsideBlocks(line: str, openQuote: str | None) -> tuple[str, str | None]:
    code = ""
    position = 0
    for quote in TRIPLE_QUOTE.finditer(line):
        isClosing = quote.group(0) == openQuote
        if openQuote is None:
            code += line[position : quote.start()]
            openQuote = quote.group(0)
            position = quote.end()
            continue
        if isClosing:
            openQuote = None
            position = quote.end()
    isLineEndingInsideABlock = openQuote is not None
    return (code if isLineEndingInsideABlock else code + line[position:]), openQuote
