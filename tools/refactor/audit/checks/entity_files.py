"""Compares each entity's file count with what its complexity predicts.

An entity's properties are its complexity; the files named for it are what the design patterns made of it.
Across a consistent codebase the two keep a steady ratio, so an entity far outside it is where the pattern
was skipped or where the code was piled into too few files.
"""
from __future__ import annotations

import re
from statistics import median

from ..enclosing_types import TYPE_DECLARATION
from ..source_files import SourceFile, matchesAny
from ..words import containsPhrase, wordsOf

PROPERTY_LINE = re.compile(r"^\s*(?:public\s+[\w<>\[\]\?,\s]+\s+\w+\s*\{\s*get|(?:readonly\s+)?\w+\??\s*:\s*[^=]+[;,]?\s*$)")
MINIMUM_ENTITIES = 4
FILE_COUNT_BAND = 2.0


BASE_TYPES = re.compile(r":\s*(?P<bases>[\w\s,<>]+?)\s*(?:\{|$|where\b)")
ABSTRACT = re.compile(r"\babstract\s+(?:partial\s+)?class\b")


def declaredBases(line: str) -> list[str]:
    found = BASE_TYPES.search(line)
    return [base.strip() for base in found.group("bases").split(",")] if found else []


def entityProperties(sourceFiles: list[SourceFile], entityGlobs: list[str]) -> dict[str, int]:
    properties: dict[str, int] = {}
    bases: dict[str, list[str]] = {}
    abstractTypes: set[str] = set()
    for sourceFile in sourceFiles:
        if not matchesAny(sourceFile.relative, entityGlobs):
            continue
        currentEntity = None
        for line in sourceFile.lines:
            declaration = TYPE_DECLARATION.match(line)
            if declaration:
                currentEntity = declaration.group(1)
                properties.setdefault(currentEntity, 0)
                bases[currentEntity] = declaredBases(line)
                if ABSTRACT.search(line):
                    abstractTypes.add(currentEntity)
            if currentEntity and not declaration and PROPERTY_LINE.match(line):
                properties[currentEntity] += 1
    return withInheritedProperties(properties, bases, abstractTypes)


def inheritedPropertyCount(bases: list[str], properties: dict[str, int], abstractTypes: set[str]) -> int:
    return sum(properties.get(base, 0) for base in bases if base in abstractTypes)


def withInheritedProperties(properties: dict[str, int], bases: dict[str, list[str]], abstractTypes: set[str]) -> dict[str, int]:
    entities = {entity: count for entity, count in properties.items() if entity not in abstractTypes}
    counted = {entity: count + inheritedPropertyCount(bases.get(entity, []), properties, abstractTypes) for entity, count in entities.items()}
    return {entity: count for entity, count in counted.items() if count > 0}


def fileCounts(sourceFiles: list[SourceFile], entities: list[str]) -> dict[str, int]:
    longestFirst = sorted(entities, key=lambda entity: len(wordsOf(entity)), reverse=True)
    counts = {entity: 0 for entity in entities}
    for sourceFile in sourceFiles:
        pathWords = wordsOf(sourceFile.relative)
        owner = next((entity for entity in longestFirst if containsPhrase(pathWords, wordsOf(entity))), None)
        if owner:
            counts[owner] += 1
    return counts


def measure(sourceFiles: list[SourceFile], patternRules: dict) -> dict:
    properties = entityProperties(sourceFiles, patternRules.get("entityGlobs", []))
    if len(properties) < patternRules.get("minimumEntities", MINIMUM_ENTITIES):
        return {"entities": 0, "entitiesOutOfRange": 0, "rows": []}
    counts = fileCounts(sourceFiles, list(properties))
    filesPerProperty = median(counts[entity] / properties[entity] for entity in properties)
    band = patternRules.get("fileCountBand", FILE_COUNT_BAND)
    rows = []
    for entity, propertyCount in sorted(properties.items()):
        expected = max(1, round(filesPerProperty * propertyCount))
        isInRange = expected / band <= counts[entity] <= expected * band
        rows.append({"entity": entity, "properties": propertyCount, "files": counts[entity], "expectedFiles": expected, "isInRange": isInRange})
    return {
        "entities": len(rows),
        "entitiesOutOfRange": sum(1 for row in rows if not row["isInRange"]),
        "filesPerProperty": round(filesPerProperty, 2),
        "rows": rows,
    }
