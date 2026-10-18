"""Flags conditions that do not read as a sentence: calls tangled inside calls, and comparisons to raw literals."""
from __future__ import annotations

import re

from ..check_result import checkResult
from ..source_files import SourceFile
from .prose import isMeasurableCodeLine, stripStringsAndComments

CONDITION_LINE = re.compile(r"^\s*(?:}\s*)?(?:else\s+)?(?:@|\{#|\{:else\s+)?(?:if|while)\b(.*)$")
CALL_OPENING = re.compile(r"\w\(")
MEMBER_OF_CALL_RESULT = re.compile(r"\)\s*\??\.\s*\w")
STRING_COMPARISON = re.compile(r"""(?:[=!]==?)\s*(?:"[^"]+"|'[^']+')|(?:"[^"]+"|'[^']+')\s*(?:[=!]==?)""")
NUMBER_COMPARISON = re.compile(r"(?:[=!]==?|[<>]=?)\s*-?(\d+(?:\.\d+)?)\b")
NUMBERS_THAT_READ_AS_WORDS = {"0", "1"}
MAX_CALL_DEPTH = 1
OPENING_PARENTHESIS = "("
CLOSING_PARENTHESIS = ")"


def deepestCallNesting(condition: str) -> int:
    openCalls = []
    deepest = 0
    for position, character in enumerate(condition):
        if character == OPENING_PARENTHESIS:
            isCall = position > 0 and (condition[position - 1].isalnum() or condition[position - 1] == "_")
            openCalls.append(isCall)
            deepest = max(deepest, sum(openCalls))
        if character == CLOSING_PARENTHESIS and openCalls:
            openCalls.pop()
    return deepest


def isTangled(condition: str) -> bool:
    withoutStrings = stripStringsAndComments(condition)
    return deepestCallNesting(withoutStrings) > MAX_CALL_DEPTH or bool(MEMBER_OF_CALL_RESULT.search(withoutStrings))


def comparesToLiteral(condition: str) -> bool:
    if "typeof" in condition:
        return False
    if STRING_COMPARISON.search(condition):
        return True
    numbers = NUMBER_COMPARISON.findall(stripStringsAndComments(condition))
    return any(number not in NUMBERS_THAT_READ_AS_WORDS for number in numbers)


def check(sourceFiles: list[SourceFile], rules: dict) -> dict:
    tangledLines = []
    literalLines = []
    for sourceFile in sourceFiles:
        for lineNumber, line in enumerate(sourceFile.lines, start=1):
            match = CONDITION_LINE.match(line) if isMeasurableCodeLine(line) else None
            if not match:
                continue
            condition = match.group(1)
            if isTangled(condition):
                tangledLines.append({"file": sourceFile.relative, "line": lineNumber})
            if comparesToLiteral(condition):
                literalLines.append({"file": sourceFile.relative, "line": lineNumber})
    return checkResult(
        "conditions",
        {
            "tangledConditionLines": len(tangledLines),
            "literalComparisonLines": len(literalLines),
            "measurementIsHeuristic": True,
        },
        {"tangled": tangledLines[:50], "literalComparisons": literalLines[:50]},
    )
