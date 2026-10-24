"""Counts each entity's properties: its own columns, those it inherits from an abstract base, and never the base itself.

A column's attributes may sit on the line above it or on the same line (`[Key, MaxLength(256)] public string Email { get; set; }`);
the property is counted either way, because the attributes are read off the line before it is matched.
"""
from __future__ import annotations

import re

from ..enclosing_types import TYPE_DECLARATION
from ..source_files import SourceFile, matchesAny

PROPERTY_LINE = re.compile(r"^\s*(?:public\s+[\w<>\[\]\?,\s]+\s+\w+\s*\{\s*get|(?:readonly\s+)?\w+\??\s*:\s*[^=]+[;,]?\s*$)")
BASE_TYPES = re.compile(r":\s*(?P<bases>[\w\s,<>]+?)\s*(?:\{|$|where\b)")
ABSTRACT = re.compile(r"\babstract\s+(?:partial\s+)?class\b")
LEADING_ATTRIBUTES = re.compile(r"^\s*(?:\[[^\]]*\]\s*)+")


def isPropertyLine(line: str) -> bool:
    withoutAttributes = LEADING_ATTRIBUTES.sub("", line, count=1)
    return PROPERTY_LINE.match(withoutAttributes) is not None


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
            if currentEntity and not declaration and isPropertyLine(line):
                properties[currentEntity] += 1
    return withInheritedProperties(properties, bases, abstractTypes)


def inheritedPropertyCount(bases: list[str], properties: dict[str, int], abstractTypes: set[str]) -> int:
    return sum(properties.get(base, 0) for base in bases if base in abstractTypes)


def withInheritedProperties(properties: dict[str, int], bases: dict[str, list[str]], abstractTypes: set[str]) -> dict[str, int]:
    entities = {entity: count for entity, count in properties.items() if entity not in abstractTypes}
    counted = {entity: count + inheritedPropertyCount(bases.get(entity, []), properties, abstractTypes) for entity, count in entities.items()}
    return {entity: count for entity, count in counted.items() if count > 0}
