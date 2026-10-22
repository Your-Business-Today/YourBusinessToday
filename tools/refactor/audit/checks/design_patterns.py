"""The design pattern file count check: predicted files that are missing, and entities outside the expected range."""
from __future__ import annotations

from ..check_names import CheckName
from ..check_result import checkResult
from ..source_files import SourceFile
from . import entity_files, pattern_roles


def check(sourceFiles: list[SourceFile], rules: dict) -> dict:
    patternRules = rules.get("designPatterns", {})
    roles = pattern_roles.measure(sourceFiles, patternRules)
    entities = entity_files.measure(sourceFiles, patternRules)
    return checkResult(
        CheckName.designPatterns,
        {
            "roleFamilies": len(roles["roleFamilies"]),
            "predictedFiles": roles["predictedFiles"],
            "predictedFilesMissing": roles["predictedFilesMissing"],
            "entities": entities["entities"],
            "entitiesOutOfRange": entities["entitiesOutOfRange"],
            "measurementIsHeuristic": True,
        },
        {
            "roleFamilies": roles["roleFamilies"],
            "patterns": roles["patterns"],
            "missingPredictedFiles": roles["missing"][:100],
            "entityFileCounts": entities["rows"],
        },
    )
