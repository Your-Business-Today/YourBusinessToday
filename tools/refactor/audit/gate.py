"""Ratchet gate: fails when quality regresses against the committed baseline.

Usage: python -m audit.gate baseline.json audit-output/audit.json
Exit code 1 on any regression; intended as a CI step after run_audit.
A figure the reading did not measure, or the baseline does not hold, cannot regress: the gate names each one
after its verdict, with the reason, so that a figure it has stopped holding is seen at every reading.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from . import figures
from .uncompared_figures import whyNotCompared

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
PASSED = "Gate passed: no figure regressed against the baseline."
FAILED = "Gate FAILED:"
NOT_COMPARED = "Not compared, so not held by this gate:"
REGRESSED_EXIT = 1
HELD_EXIT = 0
RUN_AS_SCRIPT = "__main__"


def readSummaries(path: Path) -> dict:
    return json.loads(path.read_text())["summaries"]


def compare(baseline: dict, current: dict) -> list[str]:
    regressions = []
    for checkName, figureName in RATCHETED_FIGURES:
        baselineSummary, currentSummary = baseline.get(checkName, {}), current.get(checkName, {})
        if whyNotCompared(baselineSummary, currentSummary, figureName):
            continue
        baselineValue, currentValue = baselineSummary[figureName], currentSummary[figureName]
        if currentValue > baselineValue:
            regressions.append(
                f"{checkName}.{figureName} regressed: {baselineValue} -> {currentValue}"
            )
    return regressions


def notCompared(baseline: dict, current: dict) -> list[str]:
    unheld = []
    for checkName, figureName in RATCHETED_FIGURES:
        why = whyNotCompared(baseline.get(checkName, {}), current.get(checkName, {}), figureName)
        if why:
            unheld.append(f"{checkName}.{figureName} {why}")
    return unheld


def answer(regressions: list[str], unheld: list[str]) -> list[str]:
    verdict = [FAILED, *indented(regressions)] if regressions else [PASSED]
    if not unheld:
        return verdict
    return [*verdict, NOT_COMPARED, *indented(unheld)]


def indented(lines: list[str]) -> list[str]:
    return [f"  {line}" for line in lines]


def main() -> int:
    baselinePath, currentPath = Path(sys.argv[1]), Path(sys.argv[2])
    baseline, current = readSummaries(baselinePath), readSummaries(currentPath)
    regressions = compare(baseline, current)
    print("\n".join(answer(regressions, notCompared(baseline, current))))
    return REGRESSED_EXIT if regressions else HELD_EXIT


if __name__ == RUN_AS_SCRIPT:
    sys.exit(main())
