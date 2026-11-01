"""The design pattern pass of the plan: the files the patterns predict, the entities out of range, the long backend files."""
from __future__ import annotations

from ..checks.entity_files import shouldBringIntoRange
from .steps import SHOWN_FILES, step

PATTERNS = "Pass 4 — Design pattern identification"
ENTITY_JUDGEMENT = (
    "If the count is what its pattern makes of it, record the entity in acceptedEntityCounts with the reason, "
    "rather than moving files to suit the count."
)


def describeGaps(pattern: dict) -> str:
    predicted = "; ".join(pattern["missing"][:SHOWN_FILES])
    return (
        f"{len(pattern['missing'])} of {pattern['predicted']} lack it. Predicted: {predicted}. "
        "Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps."
    )


def entityStep(row: dict) -> dict:
    counted = f"{row['properties']} properties, {row['files']} file(s) named for it, about {row['expectedFiles']} expected"
    return step(PATTERNS, f"Bring `{row['entity']}` into range", f"{counted}. {ENTITY_JUDGEMENT}")


def patternSteps(others: list[dict], designPatterns: dict) -> list[dict]:
    offenders = designPatterns["offenders"]
    steps = [
        step(PATTERNS, f"Complete the pattern: {pattern['pattern']}", describeGaps(pattern))
        for pattern in offenders["patterns"]
        if pattern["missing"]
    ]
    steps += [entityStep(row) for row in offenders["entityFileCounts"] if shouldBringIntoRange(row)]
    steps += [
        step(PATTERNS, f"Divide `{target['file']}` ({target['lines']} lines) into the units its pattern names",
             f"{len(target['functions'])} functions; the longest is {max((function['lines'] for function in target['functions']), default=0)} lines.")
        for target in others
    ]
    return steps
