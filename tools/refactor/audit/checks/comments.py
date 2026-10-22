"""Counts explanatory comments and unowned task markers."""
from __future__ import annotations

import re

from ..check_names import CheckName
from ..check_result import checkResult
from ..source_files import SourceFile

TASK_MARKER = re.compile(r"\b(TODO|FIXME|HACK)\b", re.IGNORECASE)


def markersAsList(marker: str | list[str]) -> list[str]:
    if isinstance(marker, list):
        return marker
    return [marker]


def isExplanatoryComment(strippedLine: str, markers: dict) -> bool:
    documentationMarkers = tuple(markersAsList(markers["documentation"]))
    if strippedLine.startswith(documentationMarkers):
        return False
    explanatoryMarkers = markersAsList(markers["line"]) + markersAsList(markers["markup"])
    return any(strippedLine.startswith(marker) for marker in explanatoryMarkers)


def check(sourceFiles: list[SourceFile], rules: dict) -> dict:
    markers = rules["commentMarkers"]
    commentCount = 0
    taskMarkers = []
    commentedFiles = set()
    for sourceFile in sourceFiles:
        for lineNumber, line in enumerate(sourceFile.lines, start=1):
            stripped = line.strip()
            if not isExplanatoryComment(stripped, markers):
                continue
            commentCount += 1
            commentedFiles.add(sourceFile.relative)
            if TASK_MARKER.search(stripped):
                taskMarkers.append({"file": sourceFile.relative, "line": lineNumber})
    return checkResult(
        CheckName.comments,
        {
            "explanatoryCommentLines": commentCount,
            "filesWithComments": len(commentedFiles),
            "taskMarkers": len(taskMarkers),
        },
        taskMarkers[:50],
    )
