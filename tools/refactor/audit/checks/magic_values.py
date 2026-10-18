"""Flags inline hex colours, inline style attributes, and repeated string literals.

In a markup file an attribute's value is the markup's own vocabulary — type="button", rel="noreferrer",
name="taskId" — or a class list, which widget adoption measures, so it is left out of the repeated literals.
A dictionary key — read by subscript or .get(), results["fileLength"]["summary"], or written in a literal,
{"summary": summary} — is the name of a field, as a property name is, so it is left out too; naming each key
as a constant would read worse.
"""
from __future__ import annotations

import re
from collections import Counter

from ..check_result import checkResult
from ..source_files import SourceFile, matchesAny

HEX_COLOUR = re.compile(r"#[0-9a-fA-F]{6}\b")
INLINE_STYLE = re.compile(r'style="')
STRING_LITERAL = re.compile(r'"([A-Za-z][A-Za-z0-9 _\-/]{5,40})"')
ATTRIBUTE_VALUE = re.compile(r'(?<![\w.$])([A-Za-z_:@][\w:.\-]*)="[^"]*"')
REPEATED_LITERAL_THRESHOLD = 4
SUBSCRIPT_KEY = re.compile(r'(?<=[\w)\]])\[\s*"[^"]*"\s*\]')
GET_KEY = re.compile(r'\.get\(\s*"[^"]*"')
LITERAL_KEY = re.compile(r'(^|[{,]\s*)"[^"]*"(?=\s*:)')
LISTED_OFFENDERS = 50


def withoutAttributeValues(line: str) -> str:
    return ATTRIBUTE_VALUE.sub(r'\1=""', line)


def withoutDictionaryKeys(line: str) -> str:
    withoutSubscriptKeys = SUBSCRIPT_KEY.sub('[""]', line)
    withoutReadKeys = GET_KEY.sub('.get(""', withoutSubscriptKeys)
    return LITERAL_KEY.sub(r'\1""', withoutReadKeys)


def countLiterals(line: str, isMarkup: bool, literalCounts: Counter) -> None:
    code = withoutDictionaryKeys(withoutAttributeValues(line) if isMarkup else line)
    for match in STRING_LITERAL.finditer(code):
        literalCounts[match.group(1)] += 1


def repeatedLiteralsIn(literalCounts: Counter) -> list[dict]:
    return [
        {"literal": literal, "occurrences": count}
        for literal, count in literalCounts.most_common()
        if count >= REPEATED_LITERAL_THRESHOLD
    ]


def check(sourceFiles: list[SourceFile], rules: dict) -> dict:
    markupGlobs = rules["styleTokens"]["markupGlobs"]
    hexColourHits = []
    inlineStyleHits = []
    literalCounts: Counter[str] = Counter()
    for sourceFile in sourceFiles:
        isMarkup = matchesAny(sourceFile.relative, markupGlobs)
        for lineNumber, line in enumerate(sourceFile.lines, start=1):
            if isMarkup and HEX_COLOUR.search(line):
                hexColourHits.append({"file": sourceFile.relative, "line": lineNumber})
            if isMarkup and INLINE_STYLE.search(line):
                inlineStyleHits.append({"file": sourceFile.relative, "line": lineNumber})
            countLiterals(line, isMarkup, literalCounts)
    repeatedLiterals = repeatedLiteralsIn(literalCounts)
    return checkResult(
        "magicValues",
        {
            "inlineHexColours": len(hexColourHits),
            "inlineStyleAttributes": len(inlineStyleHits),
            "repeatedStringLiterals": len(repeatedLiterals),
        },
        {
            "hexColours": hexColourHits[:LISTED_OFFENDERS],
            "inlineStyles": inlineStyleHits[:LISTED_OFFENDERS],
            "repeatedLiterals": repeatedLiterals[:LISTED_OFFENDERS],
        },
    )
