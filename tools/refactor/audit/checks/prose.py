"""Flags lines that resist reading as prose: deep member chains, deep indentation, overlong lines."""
from __future__ import annotations

import re

from ..check_result import checkResult
from ..source_files import SourceFile, matchesAny
from .member_chains import isTooDeep
from .string_literals import withoutStringText
from .text_blocks import withoutTextBlocks

COMMENT_ONLY = re.compile(r"^\s*(//|///|@\*|\*|<!--)")
IMPORT_LINE = re.compile(r"^\s*(using|namespace|@using|@namespace|global using|import|export \* from|from\s+[\w.]+\s+import)\b")
INDENTED_FILE_GLOBS_WHEN_UNSET = ["**/*.cs"]


def stripStringsAndComments(line: str) -> str:
    withoutStrings = withoutStringText(line)
    commentStart = withoutStrings.find("//")
    if commentStart >= 0:
        withoutStrings = withoutStrings[:commentStart]
    return withoutStrings


def indentDepth(line: str, indentWidth: int) -> int:
    leadingWhitespace = line[: len(line) - len(line.lstrip(" \t"))]
    tabDepth = leadingWhitespace.count("\t")
    spaceDepth = leadingWhitespace.count(" ") // indentWidth
    return tabDepth + spaceDepth


def isMeasurableCodeLine(line: str) -> bool:
    return bool(line.strip()) and not COMMENT_ONLY.match(line) and not IMPORT_LINE.match(line)


def check(sourceFiles: list[SourceFile], rules: dict) -> dict:
    proseRules = rules["prose"]
    maxLineLength = proseRules["maxLineLength"]
    maxIndentDepth = proseRules["maxIndentDepth"]
    indentWidth = proseRules["indentWidth"]
    indentedFileGlobs = proseRules.get("indentedFileGlobs", INDENTED_FILE_GLOBS_WHEN_UNSET)
    longChains = []
    deepLines = []
    overlongLines = []
    for sourceFile in sourceFiles:
        isMeasuredForIndentation = matchesAny(sourceFile.relative, indentedFileGlobs)
        codeLines = withoutTextBlocks(sourceFile.lines)
        for lineNumber, (line, codeLine) in enumerate(zip(sourceFile.lines, codeLines), start=1):
            if not isMeasurableCodeLine(line):
                continue
            code = stripStringsAndComments(codeLine)
            if isTooDeep(code, proseRules):
                longChains.append({"file": sourceFile.relative, "line": lineNumber})
            if isMeasuredForIndentation and indentDepth(line, indentWidth) > maxIndentDepth:
                deepLines.append({"file": sourceFile.relative, "line": lineNumber})
            if len(line) > maxLineLength:
                overlongLines.append({"file": sourceFile.relative, "line": lineNumber})
    return checkResult(
        "prose",
        {
            "longMemberChainLines": len(longChains),
            "deeplyIndentedLines": len(deepLines),
            "overlongLines": len(overlongLines),
            "measurementIsHeuristic": True,
        },
        {
            "memberChains": longChains[:50],
            "deepIndentation": deepLines[:50],
            "overlongLines": overlongLines[:50],
        },
    )
