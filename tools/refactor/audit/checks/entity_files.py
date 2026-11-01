"""Compares each entity's file count with what its complexity predicts.

An entity's properties are its complexity; the files named for it are what the design patterns made of it.
Across a consistent codebase the two keep a steady ratio, so an entity far outside it is where the pattern
was skipped or where the code was piled into too few files.

A file is named for an entity when the entity's subject is in the file's own name, never its directory:
`Jobs/Groups/JobGroupLookup.cs` is the job group's, and `Documents/BrandFonts.cs` is nobody's. The subject
may follow a verb, as a command's files do (`AddTodoItemEndpoint.cs`), so it is read anywhere in the name,
and the longest subject wins (`HandoverPackDocumentRow.cs` is the handover pack document's, not the document's).

The band is three times the expected count either way, because the patterns give every entity a floor of
files whatever its size, so files per property runs from many times the median for a one-column entity to a
fraction of it for a thirty-column one; a band of two flagged the floor-sized entities as too many.

An entity listed under `acceptedEntityCounts`, with the reason, is one a round has judged: its count is what its
pattern makes of it, such as a small table given the full slice for every command, or a child table whose work
its parent's files do. It keeps its measured row, marked accepted, and leaves the out-of-range count and the
plan, as an accepted gap leaves its pattern. It still counts toward the median, so accepting one entity never
moves another in or out of range.
"""
from __future__ import annotations

from pathlib import Path
from statistics import median

from ..source_files import SourceFile
from ..words import containsPhrase, wordsOf
from .entity_properties import entityProperties

MINIMUM_ENTITIES = 4
FILE_COUNT_BAND = 3.0
ENTITY_SUFFIXES = ["Entity"]


def subjectOf(entity: str, suffixes: list[str]) -> str:
    for suffix in suffixes:
        isSuffixed = entity.endswith(suffix) and len(entity) > len(suffix)
        if isSuffixed:
            return entity[: -len(suffix)]
    return entity


def fileNameWords(sourceFile: SourceFile) -> list[str]:
    fileName = Path(sourceFile.relative).stem
    return wordsOf(fileName)


def fileCounts(sourceFiles: list[SourceFile], entities: list[str], suffixes: list[str] = ENTITY_SUFFIXES) -> dict[str, int]:
    subjects = {entity: wordsOf(subjectOf(entity, suffixes)) for entity in entities}
    longestFirst = sorted(entities, key=lambda entity: len(subjects[entity]), reverse=True)
    counts = {entity: 0 for entity in entities}
    for sourceFile in sourceFiles:
        nameWords = fileNameWords(sourceFile)
        owner = next((entity for entity in longestFirst if containsPhrase(nameWords, subjects[entity])), None)
        if owner:
            counts[owner] += 1
    return counts


def shouldBringIntoRange(row: dict) -> bool:
    return not row["isInRange"] and not row["isAccepted"]


def measure(sourceFiles: list[SourceFile], patternRules: dict) -> dict:
    properties = entityProperties(sourceFiles, patternRules.get("entityGlobs", []))
    if len(properties) < patternRules.get("minimumEntities", MINIMUM_ENTITIES):
        return {"entities": 0, "entitiesOutOfRange": 0, "entitiesAccepted": 0, "rows": []}
    counts = fileCounts(sourceFiles, list(properties), patternRules.get("entitySuffixes", ENTITY_SUFFIXES))
    filesPerProperty = median(counts[entity] / properties[entity] for entity in properties)
    band = patternRules.get("fileCountBand", FILE_COUNT_BAND)
    acceptedCounts = patternRules.get("acceptedEntityCounts", {})
    rows = []
    for entity, propertyCount in sorted(properties.items()):
        expected = max(1, round(filesPerProperty * propertyCount))
        isInRange = expected / band <= counts[entity] <= expected * band
        rows.append({
            "entity": entity, "properties": propertyCount, "files": counts[entity], "expectedFiles": expected,
            "isInRange": isInRange, "isAccepted": entity in acceptedCounts,
        })
    return {
        "entities": len(rows),
        "entitiesOutOfRange": sum(1 for row in rows if shouldBringIntoRange(row)),
        "entitiesAccepted": sum(1 for row in rows if row["isAccepted"]),
        "filesPerProperty": round(filesPerProperty, 2),
        "rows": rows,
    }
