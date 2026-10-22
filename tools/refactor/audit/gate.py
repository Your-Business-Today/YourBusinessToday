"""Ratchet gate: fails when quality regresses against the committed baseline.

Usage: python -m audit.gate baseline.json audit-output/audit.json
Exit code 1 on any regression; intended as a CI step after run_audit.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from . import figures

RATCHETED_FIGURES = [
    figures.FILES_OVER_LIMIT,
    figures.WORST_FILE_LINES,
    figures.FUNCTIONS_OVER_LIMIT,
    figures.ELSE_BLOCKS,
    figures.DUPLICATED_PERCENTAGE,
    figures.EXPLANATORY_COMMENT_LINES,
    figures.INLINE_HEX_COLOURS,
    figures.ORPHAN_COMPONENTS,
    figures.ORPHAN_FUNCTIONS,
    figures.LONG_MEMBER_CHAIN_LINES,
    figures.DEEPLY_INDENTED_LINES,
    figures.OVERLONG_FUNCTION_NAMES,
    figures.GLUED_ACCESSOR_NAMES,
    figures.TANGLED_CONDITION_LINES,
    figures.LITERAL_COMPARISON_LINES,
    figures.PREDICTED_FILES_MISSING,
    figures.HAND_ROLLED_ELEMENTS,
    figures.BOXED_CONTENT_WIDGETS,
    figures.UNVALIDATED_DOORS,
    figures.LOOSER_LIMITS,
]
RUN_AS_SCRIPT = "__main__"


def readSummaries(path: Path) -> dict:
    return json.loads(path.read_text())["summaries"]


def compare(baseline: dict, current: dict) -> list[str]:
    regressions = []
    for checkName, figureName in RATCHETED_FIGURES:
        baselineValue = baseline.get(checkName, {}).get(figureName)
        currentValue = current.get(checkName, {}).get(figureName)
        if baselineValue is None or currentValue is None:
            continue
        if currentValue > baselineValue:
            regressions.append(
                f"{checkName}.{figureName} regressed: {baselineValue} -> {currentValue}"
            )
    return regressions


def main() -> int:
    baselinePath, currentPath = Path(sys.argv[1]), Path(sys.argv[2])
    regressions = compare(readSummaries(baselinePath), readSummaries(currentPath))
    if not regressions:
        print("Gate passed: no figure regressed against the baseline.")
        return 0
    print("Gate FAILED:")
    for regression in regressions:
        print(f"  {regression}")
    return 1


if __name__ == RUN_AS_SCRIPT:
    sys.exit(main())
